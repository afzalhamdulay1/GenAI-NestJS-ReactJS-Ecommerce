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

  const client = new MongoClient(uri!);
  await client.connect();
  const db = client.db();
  const collection = db.collection('products');

  const genAI = new GoogleGenerativeAI(apiKey!);
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

  const query = "do you have a jacket?";
  console.log(`Generating embedding for: "${query}"`);
  
  const embedResult = await model.embedContent(query);
  const userVector = embedResult.embedding.values;
  
  console.log(`Vector length: ${userVector.length}`);

  const jacket = await collection.findOne({ name: /jacket/i });
  const shirt = await collection.findOne({ name: /green shirt/i });
  
  const queryEmbed = await model.embedContent({
      content: { role: 'user', parts: [{ text: "do you have it in red color?" }] },
      taskType: 'RETRIEVAL_QUERY'
  } as any);
  const qVec = queryEmbed.embedding.values;

  if (jacket) {
      const docText = `${jacket.name || ''} ${jacket.category || ''} ${jacket.description || ''} ${jacket.tags ? jacket.tags.join(' ') : ''}`;
      console.log("Jacket Options from DB:", JSON.stringify(jacket.options, null, 2));
      console.log("Jacket Variants from DB:", JSON.stringify(jacket.variants, null, 2));
      
      const docEmbed = await model.embedContent({
          content: { role: 'user', parts: [{ text: docText }] },
          taskType: 'RETRIEVAL_DOCUMENT'
      } as any);
      const dVec = docEmbed.embedding.values;
      
      let dotProduct = 0; let normA = 0; let normB = 0;
      for (let i = 0; i < qVec.length; i++) {
          dotProduct += qVec[i] * dVec[i];
          normA += qVec[i] * qVec[i];
          normB += dVec[i] * dVec[i];
      }
      console.log(`Jacket similarity with taskType: ${dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))}`);
  }
  
  if (shirt) {
      const docText = `${shirt.name || ''} ${shirt.category || ''} ${shirt.description || ''} ${shirt.tags ? shirt.tags.join(' ') : ''}`;
      const docEmbed = await model.embedContent({
          content: { role: 'user', parts: [{ text: docText }] },
          taskType: 'RETRIEVAL_DOCUMENT'
      } as any);
      const dVec = docEmbed.embedding.values;
      
      let dotProduct = 0; let normA = 0; let normB = 0;
      for (let i = 0; i < qVec.length; i++) {
          dotProduct += qVec[i] * dVec[i];
          normA += qVec[i] * qVec[i];
          normB += dVec[i] * dVec[i];
      }
      console.log(`Shirt similarity with taskType: ${dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))}`);
  }

  await client.close();
  process.exit(0);
}

run();
