import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const modelsToTry = [
    'gemini-3.6-flash',
    'gemini-3.6-flash-lite',
  ];

  const systemInstruction = 'You are a helpful AI.';
  const userMessage = 'do you have a jacket which is red';

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying ${modelName}...`);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction,
      });

      const chat = model.startChat({
        history: [],
      });

      const result = await chat.sendMessage(userMessage);
      const response = await result.response;
      console.log(`${modelName} success! Reply length:`, response.text().length);
      break;
    } catch (err: any) {
      console.error(`${modelName} failed:`, err.message);
    }
  }
}
run();
