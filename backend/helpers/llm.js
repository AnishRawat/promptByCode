import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Using gemini-1.5-pro for better stability with code analysis
// This model has better support and handles large contexts well
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  }
});

export async function askLLM(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Check if response is empty
    if (!text || text.trim().length === 0) {
      throw new Error("Model returned an empty response. The content might have triggered safety filters or the model couldn't process it.");
    }

    return text;
  } catch (err) {
    console.error("Gemini API Error:", err);
    console.error("Error message:", err.message);

    // Provide more helpful error messages
    if (err.message && err.message.includes("404")) {
      throw new Error("Gemini model not found. Please check your API key has access to gemini-1.5-pro");
    }

    throw new Error(`Gemini API failed: ${err.message}`);
  }
}