const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

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

async function testChat(modelName) {
  console.log(`Testing startChat on: ${modelName}...`);
  const t0 = Date.now();
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: "You are a helpful assistant."
    });
    const chat = model.startChat();
    const res = await chat.sendMessage("Hi");
    const elapsed = Date.now() - t0;
    console.log(` ⚡ SUCCESS! ${modelName} took ${elapsed}ms. Response: "${res.response.text().trim()}"`);
  } catch (err) {
    console.log(` ❌ FAILED! ${modelName} failed in ${Date.now() - t0}ms: ${err.message}`);
  }
}

async function run() {
  const models = [
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
    'gemini-2.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.6-flash'
  ];
  for (const m of models) {
    await testChat(m);
  }
  process.exit(0);
}

run();
