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
    const { selectedFiles, customPrompt, model } = req.body;

    if (!selectedFiles || !Array.isArray(selectedFiles) || selectedFiles.length === 0) {
      return res.status(400).json({ success: false, error: "No files provided" });
    }

    logger.info({
      message: "Summarize request received",
      totalFiles: selectedFiles.length,
      fileNames: selectedFiles.map(f => f.name || f.path),
      hasCustomPrompt: !!customPrompt,
      model: model || "gemini"
    });

    console.log("🔥 SERVER.JS: Model parameter received:", model);
    console.log("🔥 SERVER.JS: Will pass to askLLM:", model || "gemini");

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
    const summary = await askLLM(finalPrompt, model);

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

// --------------------------- WEATHER THEME ---------------------------

import axios from "axios";

app.get("/weather-theme", async (req, res) => {
  try {
    // Get IP address
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Handle localhost/::1
    if (ip === "::1" || ip === "127.0.0.1") {
      // Default to a known IP for testing if local, or just return a default
      // Using a public IP for testing (e.g., Google DNS is not good for geo, let's use a placeholder or just failover)
      // Actually, wttr.in handles empty IP by detecting the request IP.
      ip = "";
    }

    logger.info({ message: "Weather theme request", ip });

    // Call Weather API
    // wttr.in returns JSON with ?format=j1
    const weatherUrl = `https://wttr.in/${ip}?format=j1`;
    const response = await axios.get(weatherUrl);
    const currentCondition = response.data.current_condition[0];

    // Determine theme
    // weatherCode: https://worldweatheronline.com/weather-api/api/docs/weather-icons.aspx
    // Simple logic: Is it night? Is it raining/cloudy?

    // wttr.in doesn't explicitly give is_day, but we can infer or just use weather descriptions.
    // Let's use a simple heuristic for now:
    // If description contains "Sunny" or "Clear" -> Light (unless it's night, which is hard to tell without time)
    // Actually, wttr.in gives "observation_time".

    // Better approach: Use open-meteo which gives is_day
    // But open-meteo needs lat/lon. wttr.in is easier with IP.

    // Let's stick to wttr.in and look at the weather description.
    // If it's "Sunny" -> Light.
    // If "Clear" -> Light (could be night clear, but let's assume light for positive vibes?)
    // Actually, users usually want Dark mode at night.

    // Let's try to get time from the response or just use the system time if we can't get it.
    // But this is server side, so system time is server time.

    // Let's use the weather description to drive the "vibe".
    // Rain/Mist/Fog/Cloudy -> Dark Theme (Cozy)
    // Sunny/Clear -> Light Theme (Bright)

    const weatherDesc = currentCondition.weatherDesc[0].value.toLowerCase();
    let theme = "light";

    // Granular Theme Logic
    if (weatherDesc.includes("snow") || weatherDesc.includes("ice") || weatherDesc.includes("blizzard")) {
      theme = "snow";
    } else if (weatherDesc.includes("rain") || weatherDesc.includes("drizzle") || weatherDesc.includes("thunder") || weatherDesc.includes("storm")) {
      theme = "rain";
    } else if (weatherDesc.includes("fog") || weatherDesc.includes("mist") || weatherDesc.includes("haze") || weatherDesc.includes("cloud") || weatherDesc.includes("overcast")) {
      theme = "cloudy";
    } else if (weatherDesc.includes("sunny") || weatherDesc.includes("clear")) {
      // Check for night time? wttr.in doesn't give local time easily.
      // We can assume if it's "clear" it might be night or day. 
      // "Sunny" is definitely day.
      // Let's just use "sunny" for now.
      theme = "sunny";
    } else {
      // Default fallback
      theme = "light";
    }

    logger.info({
      message: "Weather determined",
      weather: weatherDesc,
      theme
    });

    res.json({ success: true, theme, weather: weatherDesc });

  } catch (err) {
    logger.error({
      message: "Weather theme failed",
      error: err.message
    });
    // Fallback to light
    res.json({ success: true, theme: "light", error: "Failed to fetch weather" });
  }
});

// --------------------------- START SERVER ---------------------------

const PORT = 5000;
app.listen(PORT, () =>
  console.log("Backend running on port", PORT)
);
