// listModels.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env

async function listAvailableModels() {
  console.log("--- Listing available Google Generative AI models ---");
  let foundFlashModel = false;
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = await genAI.listModels();
    for await (const model of models) {
      if (model.supportedGenerationMethods && model.supportedGenerationMethods.includes("generateContent")) {
        console.log(`\nModel Name: ${model.name}`);
        console.log(`Display Name: ${model.displayName}`);
        console.log(`Description: ${model.description}`);
        console.log(`Supported Methods: ${model.supportedGenerationMethods.join(", ")}`);
        // Check if it's a 'flash' model
        if (model.name.toLowerCase().includes('flash')) {
          console.log("--> This appears to be a Gemini Flash model!");
          foundFlashModel = true;
        }
      }
    }
    if (!foundFlashModel) {
        console.log("\nNo Gemini Flash models were explicitly found supporting generateContent in the list.");
        console.log("Please double-check your API key, project settings, and region availability with Google AI documentation.");
    }
  } catch (error) {
    console.error("Error listing models:", error);
    if (error.response && error.response.status === 403) {
      console.error("403 Forbidden: Your API key might be invalid or not have the necessary permissions.");
    }
  }
  console.log("--- Finished listing models ---");
}

listAvailableModels();