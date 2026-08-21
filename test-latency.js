const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  // 1. Time the Flash-Lite Router LLM
  let start = Date.now();
  const routerModel = genAI.getGenerativeModel({ model: 'gemini-3.6-flash-lite' });
  await routerModel.generateContent('Classify intent as PRODUCT_SEARCH or GENERAL_CHAT: "do you have a jacket"');
  let routerTime = Date.now() - start;
  console.log(`Router (flash-lite) took: ${routerTime}ms`);

  // 2. Time standard Flash LLM
  start = Date.now();
  const chatModel = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
  await chatModel.generateContent('User said: hey. Reply nicely.');
  let chatTime = Date.now() - start;
  console.log(`Chat (flash) took: ${chatTime}ms`);
}
run();
