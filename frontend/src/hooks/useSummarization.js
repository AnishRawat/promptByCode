import { useState } from 'react';

export const useSummarization = () => {
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [customPrompt, setCustomPrompt] = useState("");

    const handleSummarize = async (selectedFiles, model) => {
        if (selectedFiles.length === 0) {
            setError("Please select at least one file to summarize.");
            return;
        }

        // Validate content before sending
        const validFiles = selectedFiles.filter(f => f.content && f.content.trim().length > 0);

        if (validFiles.length === 0) {
            setError("Selected files are empty or could not be read.");
            return;
        }

        setLoading(true);
        setError("");
        setSummary("");

        const payload = validFiles.map(f => ({
            name: f.name,
            path: f.path,
            content: f.content
        }));

        console.log("📦 Final Payload Sent:", payload);
        console.log("📝 Custom Prompt:", customPrompt);
        console.log("🤖 Model:", model);

        try {
            // Send to backend (Vercel API route)
            const response = await fetch("/api/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selectedFiles: payload, customPrompt: customPrompt, model: model }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server error ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            if (data.success) {
                setSummary(data.summary);
            } else {
                throw new Error(data.message || "Failed to generate summary.");
            }
        } catch (err) {
            console.error("Summarization error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        summary,
        loading,
        error,
        customPrompt,
        setCustomPrompt,
        handleSummarize
    };
};
