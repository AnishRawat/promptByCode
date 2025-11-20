import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
    }
});

async function askLLM(prompt) {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text || text.trim().length === 0) {
            throw new Error("Model returned an empty response.");
        }

        return text;
    } catch (err) {
        console.error("Gemini API Error:", err);
        if (err.message && err.message.includes("404")) {
            throw new Error("Gemini model not found. Check API key/access.");
        }
        throw new Error(`Gemini API failed: ${err.message}`);
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
        const { selectedFiles, customPrompt } = req.body;

        if (!selectedFiles || !Array.isArray(selectedFiles) || selectedFiles.length === 0) {
            return res.status(400).json({ success: false, error: "No files provided" });
        }

        console.log({
            message: "Summarize request received",
            totalFiles: selectedFiles.length,
            hasCustomPrompt: !!customPrompt
        });

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

        console.log("Sending prompt to LLM...");

        // Call LLM
        const summary = await askLLM(finalPrompt);

        console.log("Received LLM response");

        res.status(200).json({ success: true, summary });

    } catch (err) {
        console.error("Summarization error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
}
