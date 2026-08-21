const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.DB_URI);
  console.log("Connected.");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // 1. Get embedding
  console.log("Generating embedding for: 'do you have a jakcet which is rde'...");
  const embedModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const embedResult = await embedModel.embedContent('do you have a jakcet which is rde');
  const { pipeline } = await import('@xenova/transformers');
  const localModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  
  const query = "do you have a jacket which is red";
  const localResult = await localModel(query, { pooling: 'mean', normalize: true });
  const userVector = Array.from(localResult.data);

  console.log("Measuring $vectorSearch + $lookup speed...");
  const t0 = Date.now();
  const results = await mongoose.connection.collection('product_chunks').aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'localEmbedding',
        queryVector: userVector,
        numCandidates: 100,
        limit: 5
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'parentProduct'
      }
    },
    {
      $unwind: '$parentProduct'
    },
    {
      $replaceRoot: { newRoot: '$parentProduct' }
    }
  ]).toArray();

  const elapsed = Date.now() - t0;
  console.log(`Aggregation ($vectorSearch + $lookup) completed in: ${elapsed}ms`);
  console.log(`Results count: ${results.length}`);
  results.forEach((p, i) => console.log(`${i+1}. ${p.name}`));
  process.exit(0);

  // 2. Benchmark Vector Search
  console.log("Running $vectorSearch...");
  const collection = mongoose.connection.collection('products');
  
  const start = Date.now();
  const products = await collection.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index',
        path: 'embedding',
        queryVector: userVector,
        numCandidates: 100,
        limit: 5,
      },
    },
    {
      $project: {
        name: 1,
        score: { $meta: "vectorSearchScore" }
      },
    },
  ]).toArray();
  const dbTime = Date.now() - start;

  console.log(`\nVector Search completed in: ${dbTime}ms`);
  console.log("Results found:");
  products.forEach((p, i) => {
    console.log(`${i + 1}. ${p.name} (Similarity Score: ${p.score})`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
