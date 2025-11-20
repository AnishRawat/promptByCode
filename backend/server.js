import express from "express";
import cors from "cors";
import { askLLM } from "./helpers/llm.js";
import winston from "winston";

// --------------------------- LOGGER SETUP ---------------------------

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.Console()  // also print to console
  ]
});

// --------------------------- EXPRESS APP ---------------------------

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors());

// RAM storage (temporary)
let storedFiles = {};

// --------------------------- LOG ROUTE ---------------------------

app.post("/log", (req, res) => {
  const { message, data } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: "Missing log message" });
  }

  logger.info({
    message,
    data,
    timestamp: new Date().toISOString()
  });

  res.json({ success: true });
});

// --------------------------- UPLOAD ROUTE ---------------------------

app.post("/upload", (req, res) => {
  const { fileName, fileContent } = req.body;

  storedFiles[fileName] = fileContent;

  logger.info({
    message: "File uploaded",
    fileName,
    fileSize: fileContent?.length || 0
  });

  res.json({ success: true, message: `${fileName} uploaded` });
});

// --------------------------- LIST FILES ---------------------------

app.get("/files", (req, res) => {
  logger.info({
    message: "Files requested",
    totalFiles: Object.keys(storedFiles).length
  });

  res.json({ success: true, files: Object.keys(storedFiles) });
});

// --------------------------- SUMMARIZE ---------------------------

app.post("/summarize", async (req, res) => {
  try {
    const { selectedFiles, customPrompt } = req.body;

    if (!selectedFiles || !Array.isArray(selectedFiles) || selectedFiles.length === 0) {
      return res.status(400).json({ success: false, error: "No files provided" });
    }

    logger.info({
      message: "Summarize request received",
      totalFiles: selectedFiles.length,
      fileNames: selectedFiles.map(f => f.name || f.path),
      hasCustomPrompt: !!customPrompt
    });

    // Build combined text
    let combinedText = selectedFiles
      .map((f) => `File: ${f.path || f.name}\nContent:\n${f.content || ""}`)
      .join("\n\n");

    if (!combinedText.trim()) {
      logger.error({ message: "Combined text is empty" });
      return res.status(400).json({ success: false, error: "Files contain no content" });
    }

    // Log preview
    logger.info({
      message: "Combined text ready",
      length: combinedText.length,
      preview: combinedText.substring(0, 300)
    });

    // Create prompt with custom instruction if provided
    let finalPrompt;
    if (customPrompt && customPrompt.trim()) {
      finalPrompt = `${customPrompt}\n\nHere are the code/project files:\n\n${combinedText}`;
    } else {
      finalPrompt = `Summarize the following code/project files:\n\n${combinedText}`;
    }

    logger.info({
      message: "Sending prompt to LLM",
      promptSample: finalPrompt.substring(0, 500)
    });

    // Call LLM
    const summary = await askLLM(finalPrompt);

    logger.info({
      message: "Received LLM response",
      responseSample: summary?.substring(0, 300)
    });

    res.json({ success: true, summary });

  } catch (err) {
    logger.error({
      message: "Summarization error",
      error: err.message,
      stack: err.stack
    });

    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------- TEST LLM ---------------------------

app.get("/test-llm", async (req, res) => {
  try {
    logger.info({ message: "Test LLM request" });

    const response = await askLLM("Hello! This is a test.");

    logger.info({
      message: "LLM test success",
      responseSample: response.substring(0, 200)
    });

    res.json({ success: true, output: response });
  } catch (err) {
    logger.error({
      message: "Test LLM failed",
      error: err.message
    });

    res.status(500).json({ success: false, error: err.message });
  }
});

// --------------------------- START SERVER ---------------------------

const PORT = 5000;
app.listen(PORT, () =>
  console.log("Backend running on port", PORT)
);
