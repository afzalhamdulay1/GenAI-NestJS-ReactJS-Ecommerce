import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// Load .env variables
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
    console.error("Missing GEMINI_API_KEY in .env");
    process.exit(1);
  }

  const docsDir = path.join(process.cwd(), 'data', 'docs');
  const vectorsDir = path.join(process.cwd(), 'data', 'vectors');

  if (!fs.existsSync(docsDir)) {
    console.error(`Docs directory not found: ${docsDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(vectorsDir)) {
    fs.mkdirSync(vectorsDir, { recursive: true });
  }

  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
  console.log(`Found ${files.length} Markdown files to process in ${docsDir}`);

  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

  const { pipeline } = await import('@xenova/transformers');
  console.log("Loading Local MiniLM Model...");
  const localModel = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  let totalChunksCount = 0;

  for (const file of files) {
    const filePath = path.join(docsDir, file);
    const rawContent = fs.readFileSync(filePath, 'utf8');
    const docTitle = file.replace('.md', '').replace(/-/g, ' ').toUpperCase();

    // Split document by sections or paragraphs (~200 words per chunk)
    const paragraphs = rawContent.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const chunksText: string[] = [];

    let currentChunk = '';
    for (const p of paragraphs) {
      if ((currentChunk + ' ' + p).split(/\s+/).length > 200) {
        if (currentChunk) chunksText.push(currentChunk.trim());
        currentChunk = p;
      } else {
        currentChunk += '\n\n' + p;
      }
    }
    if (currentChunk.trim()) {
      chunksText.push(currentChunk.trim());
    }

    console.log(`\nProcessing file: "${file}" (${chunksText.length} chunks)...`);

    const fileVectorChunks: any[] = [];

    for (let index = 0; index < chunksText.length; index++) {
      const segment = chunksText[index];
      const chunkText = `DOCUMENT: "${docTitle}" | CONTENT: ${segment}`.trim();

      try {
        // 1. Gemini Embedding (3072 dims)
        const result = await geminiModel.embedContent({
          content: { role: 'user', parts: [{ text: chunkText }] },
          taskType: 'RETRIEVAL_DOCUMENT'
        } as any);
        const embedding = result.embedding.values;

        // 2. Local Embedding (384 dims)
        const localResult = await localModel(chunkText, { pooling: 'mean', normalize: true });
        const localEmbedding = Array.from(localResult.data);

        fileVectorChunks.push({
          id: `${file.replace('.md', '')}_chunk_${index + 1}`,
          docTitle,
          fileName: file,
          chunkIndex: index + 1,
          chunkText,
          embedding,
          localEmbedding,
        });

        console.log(` -> Encoded Chunk ${index + 1}/${chunksText.length}`);
      } catch (err: any) {
        console.error(` -> Failed on chunk ${index + 1}: ${err.message}`);
      }
    }

    // Write vector file for this document
    const vectorFileName = file.replace('.md', '.vectors.json');
    const vectorFilePath = path.join(vectorsDir, vectorFileName);
    fs.writeFileSync(vectorFilePath, JSON.stringify(fileVectorChunks, null, 2), 'utf8');
    console.log(`Saved ${fileVectorChunks.length} vector chunks to: ${vectorFileName}`);

    totalChunksCount += fileVectorChunks.length;
  }

  console.log(`\n🎉 Ingestion Complete! Created ${totalChunksCount} total vector chunks across ${files.length} vector files in ${vectorsDir}`);
  process.exit(0);
}

run();
