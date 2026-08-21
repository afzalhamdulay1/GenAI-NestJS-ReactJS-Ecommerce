import * as fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Missing GEMINI_API_KEY");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    const model2 = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const res2 = await model2.embedContent({ content: "test", outputDimensionality: 768 } as any);
    console.log("gemini-embedding-001 length:", res2.embedding.values.length);
  } catch(e) { console.log("gemini-embedding-001 error", e.message); }


}

run();
