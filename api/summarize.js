import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

// Vercel environment variables are accessed directly via process.env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

console.log("🔑 API Keys Check:", {
    gemini: GEMINI_API_KEY ? `${GEMINI_API_KEY.substring(0, 10)}...` : "MISSING",
    groq: GROQ_API_KEY ? `${GROQ_API_KEY.substring(0, 10)}...` : "MISSING"
});

// Initialize Gemini
let geminiModel;
try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
        }
    });
} catch (err) {
    console.error("Gemini API Error:", err);
}

// Initialize Groq
const groq = new Groq({ apiKey: GROQ_API_KEY });
async function listModels() {
    const models = await groq.models.list();
    console.log("Available Groq models:");
    models.data.forEach(m => console.log("-", m.id));
}

async function askLLM(prompt, modelId = "gemini-2.5-flash") {
    try {
        let text = "";
        console.log(`🔍 askLLM called with model: '${modelId}'`);

        // Determine provider based on model ID
        const isGemini = modelId.startsWith("gemini");

        if (!isGemini) {
            // Assume Groq for non-Gemini models (llama, mixtral, etc.)
            console.log(`🚀 Using Groq Model (${modelId})...`);
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: modelId,
                temperature: 0.7,
                max_tokens: 8192,
            });
            text = completion.choices[0]?.message?.content || "";
        } else {
            // Gemini Models
            console.log(`✨ Using Gemini Model (${modelId})...`);
            // Re-initialize model with specific ID if needed, or use the default instance if it matches
            // For simplicity, we'll get a new instance for the specific model requested
            const specificGeminiModel = new GoogleGenerativeAI(GEMINI_API_KEY).getGenerativeModel({
                model: modelId,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 8192,
                }
            });

            const result = await specificGeminiModel.generateContent(prompt);
            const response = await result.response;
            text = response.text();
        }

        if (!text || text.trim().length === 0) {
            throw new Error("Model returned an empty response.");
        }

        return text;
    } catch (err) {
        console.error(`LLM API Error (${modelId}):`, err);
        throw new Error(`API failed for ${modelId}: ${err.message}`);
    }
}

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { selectedFiles, customPrompt, model } = req.body;

        console.log("📦 Request received:", {
            totalFiles: selectedFiles?.length,
            hasCustomPrompt: !!customPrompt,
            model: model || "gemini-2.5-flash"
        });

        if (!selectedFiles || !Array.isArray(selectedFiles) || selectedFiles.length === 0) {
            return res.status(400).json({ success: false, error: "No files provided" });
        }

        // Build combined text
        let combinedText = selectedFiles
            .map((f) => `File: ${f.path || f.name}\nContent:\n${f.content || ""}`)
            .join("\n\n");

        if (!combinedText.trim()) {
            return res.status(400).json({ success: false, error: "Files contain no content" });
        }

        // Create prompt
        let finalPrompt;
        if (customPrompt && customPrompt.trim()) {
            finalPrompt = `${customPrompt}\n\nHere are the code/project files:\n\n${combinedText}`;
        } else {
            finalPrompt = `Summarize the following code/project files:\n\n${combinedText}`;
        }

        listModels();
        // Call LLM with model selection
        const summary = await askLLM(finalPrompt, model || "gemini-2.5-flash");

        res.status(200).json({ success: true, summary });

    } catch (err) {
        console.error("Summarization error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
}
