// npm install @google/generative-ai
// npm install mime
// npm install -D @types/node

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_AI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  safetySettings: [],
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 20,
  maxOutputTokens: 4096,  // Increased token limit
  responseMimeType: "application/json",
};

export const chatSession = model.startChat({
  generationConfig,
  history: [], // No prefilled large history
});
