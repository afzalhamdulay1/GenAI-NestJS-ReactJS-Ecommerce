import { MongoClient } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    process.env[match[1].trim()] = val;
  }
});

async function run() {
  const uri = process.env.DB_URI;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!uri || !apiKey) {
    console.error("Missing DB_URI or GEMINI_API_KEY");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  console.log("Connected to MongoDB!");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

  const db = client.db();
  const productsCollection = db.collection('products');
  const chunksCollection = db.collection('product_chunks');
  
  // Clear existing chunks collection
  await chunksCollection.deleteMany({});
  console.log("Cleared existing product_chunks collection.");

  const products = await productsCollection.find({}).toArray();
  console.log(`Found ${products.length} products to chunk & embed.`);
  
  const { pipeline } = await import('@xenova/transformers');
  console.log("Loading Local MiniLM Model...");
  const localModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  for (const p of products) {
    let variantsText = '';
    if (p.hasVariants && p.options && p.options.length > 0) {
        variantsText = 'Options: ' + p.options.map((opt: any) => `${opt.name} (${opt.values.join(', ')})`).join('; ');
    }
    
    // Chunking Algorithm: Split description into ~200 word blocks
    const fullDesc = (p.description || '').trim();
    const words = fullDesc.split(/\s+/).filter(Boolean);
    const chunkSize = 200; // 200 words per chunk
    const descChunks: string[] = [];

    if (words.length === 0) {
      descChunks.push('');
    } else {
      for (let i = 0; i < words.length; i += chunkSize) {
        descChunks.push(words.slice(i, i + chunkSize).join(' '));
      }
    }

    console.log(`Product "${p.name}" split into ${descChunks.length} chunk(s).`);

    for (let index = 0; index < descChunks.length; index++) {
      const segment = descChunks[index];
      const chunkText = `Product: "${p.name || ''}" | Category: ${p.category || ''} | ${variantsText} | Details: ${segment} ${p.tags ? p.tags.join(' ') : ''}`.trim();

      try {
        // 1. Gemini Embedding (3072 dims)
        const result = await model.embedContent({
            content: { role: 'user', parts: [{ text: chunkText }] },
            taskType: 'RETRIEVAL_DOCUMENT'
        } as any);
        const embedding = result.embedding.values;

        // 2. Local Embedding (384 dims)
        const localResult = await localModel(chunkText, { pooling: 'mean', normalize: true });
        const localEmbedding = Array.from(localResult.data);

        await chunksCollection.insertOne({
          productId: p._id,
          chunkIndex: index + 1,
          chunkText,
          embedding,
          localEmbedding,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Also update product with legacy embedding for backwards compatibility
        if (index === 0) {
          await productsCollection.updateOne({ _id: p._id }, { $set: { embedding, localEmbedding } });
        }
        
        console.log(` -> Inserted Chunk ${index + 1}/${descChunks.length} for "${p.name}"`);
      } catch(e: any) {
        console.error(`Failed on chunk ${index + 1} for ${p.name}:`, e.message);
      }
    }
  }

  console.log('Migration Done!');
  await client.close();
  process.exit(0);
}

run();
