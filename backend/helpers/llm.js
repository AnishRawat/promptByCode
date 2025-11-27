import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

console.log("Loaded KEY:", process.env.GEMINI_API_KEY);

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  }
});

// Initialize Groq
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function askLLM(prompt, model = "gemini") {
  try {
    let text = "";

    console.log(`🔍 askLLM called with model: '${model}'`);
    console.log(`🔑 Gemini Key Present: ${!!process.env.GEMINI_API_KEY}`);
    console.log(`🔑 Groq Key Present: ${!!process.env.GROQ_API_KEY}`);

    if (model === "groq") {
      console.log("🚀 Using Groq Model (llama3-70b-8192)...");
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama3-70b-8192",
        temperature: 0.7,
        max_tokens: 8192,
      });
      text = completion.choices[0]?.message?.content || "";
    } else {
      console.log("✨ Using Gemini Model (gemini-1.5-pro)...");
      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      text = response.text();
    }

    // Check if response is empty
    if (!text || text.trim().length === 0) {
      throw new Error("Model returned an empty response. The content might have triggered safety filters or the model couldn't process it.");
    }

    return text;
  } catch (err) {
    console.error(`${model === "groq" ? "Groq" : "Gemini"} API Error:`, err);
    console.error("Error message:", err.message);

    // Provide more helpful error messages
    if (err.message && err.message.includes("404")) {
      throw new Error("Model not found. Please check your API key and model availability.");
    }

    throw new Error(`AI Model failed: ${err.message}`);
  }
}