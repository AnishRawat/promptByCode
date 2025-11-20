import React, { useState, useRef, useEffect } from "react";
import FileTree from "./FileTree.jsx";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import { FaCloudUploadAlt, FaCopy, FaCheck, FaExclamationCircle, FaSpinner, FaFolderOpen, FaFile, FaChevronDown, FaChevronRight } from "react-icons/fa";

export default function FolderUploader() {
  const [fileTree, setFileTree] = useState({ name: "Root", children: [], isDirectory: true });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copying, setCopying] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Collapsible state
  const [isUploadOpen, setIsUploadOpen] = useState(true);
  const [isFilesOpen, setIsFilesOpen] = useState(true);
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const containerRef = useRef();
  const leftRef = useRef();
  const isResizing = useRef(false);

  // --- File Processing Logic ---

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;

    setLoading(true);
    setError("");
    setSummary("");
    setSelectedFiles([]); // Reset selection on new upload

    const newTree = { name: "Root", children: [], isDirectory: true };
    const allFiles = [];

    // Filter Configuration
    const IGNORED_FOLDERS = ["node_modules", ".git", ".vscode", "dist", "build", "coverage", "__pycache__", "bin", "obj"];
    const IGNORED_FILES = ["package-lock.json", "yarn.lock", ".DS_Store", ".env", "package.json", "eslint.config.js"];
    const ALLOWED_EXTENSIONS = [
      "js", "jsx", "ts", "tsx", "py", "java", "c", "cpp", "h", "hpp", "cs",
      "html", "css", "scss", "less", "json", "md", "txt", "php", "rb", "go",
      "rs", "sh", "bat", "yml", "yaml", "xml", "sql", "properties", "ini"
    ];

    try {
      for (const file of files) {
        // Determine path
        const path = file.webkitRelativePath || file.name;
        const parts = path.split("/").filter(Boolean);

        // 1. Check for Ignored Folders
        if (parts.some(part => IGNORED_FOLDERS.includes(part))) {
          continue;
        }

        // 2. Check for Ignored Files
        if (IGNORED_FILES.includes(file.name)) {
          continue;
        }

        // 3. Check Extension (Simple Text Filter)
        const ext = file.name.split(".").pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext) && file.name.includes(".")) {
          // If it has an extension and it's not in our allowlist, skip it.
          // Files without extensions (like 'LICENSE' or 'Makefile') might be text, so we can optionally include them or check mime type.
          // For now, let's be strict as requested.
          if (file.name.toLowerCase() !== "makefile" && file.name.toLowerCase() !== "license") {
            continue;
          }
        }

        let current = newTree;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          let node = current.children.find((c) => c.name === part);

          if (!node) {
            const isFile = i === parts.length - 1;
            node = {
              name: part,
              children: [],
              isFile: isFile,
              path: parts.slice(0, i + 1).join("/"),
              id: `${path}-${Date.now()}-${Math.random()}`,
            };
            current.children.push(node);
            // Sort: Directories first, then files
            current.children.sort((a, b) => {
              if (a.isFile === b.isFile) return a.name.localeCompare(b.name);
              return a.isFile ? 1 : -1;
            });
          }
          current = node;
        }

        if (current.isFile) {
          try {
            // CRITICAL FIX: Ensure content is read immediately and stored
            current.content = await file.text();
            allFiles.push(current);
          } catch (readError) {
            console.error(`Failed to read file ${file.name}:`, readError);
            current.content = `Error reading file: ${readError.message}`;
          }
        }
      }
      setFileTree(newTree);
      // Auto-expand file tree section if files are loaded
      setIsFilesOpen(true);
    } catch (err) {
      console.error("Error processing files:", err);
      setError("Failed to process uploaded files.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileInput = (e) => {
    processFiles(e.target.files);
  };

  // --- Drag and Drop for File Upload ---

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
    setIsUploadOpen(true); // Auto-open upload section on drag
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // --- Summarization Logic ---

  const [customPrompt, setCustomPrompt] = useState("");

  // --- File Processing Logic ---
  // ... (processFiles remains the same)

  // --- Summarization Logic ---

  const handleSummarize = async () => {
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

    try {
      const response = await fetch("http://localhost:5000/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedFiles: payload,
          customPrompt: customPrompt
        }),
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

  // --- Copy to Clipboard ---

  const handleCopy = () => {
    if (!summary) return;
    navigator.clipboard.writeText(summary);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  // --- Resizable Split Pane Logic ---

  const startResize = (e) => {
    isResizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const stopResize = () => {
    isResizing.current = false;
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  };

  const resize = (e) => {
    if (!isResizing.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;
    if (newWidth > 250 && newWidth < containerRect.width - 400) {
      leftRef.current.style.width = `${newWidth}px`;
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResize);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResize);
    };
  }, []);

  // --- UI Components ---

  const SectionHeader = ({ title, isOpen, onClick }) => (
    <div
      onClick={onClick}
      style={{
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        userSelect: "none",
        background: "#f8f9fa",
        borderBottom: "1px solid #e9ecef",
        borderTop: "1px solid #e9ecef",
      }}
    >
      <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#495057", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {title}
      </h3>
      {isOpen ? <FaChevronDown color="#adb5bd" /> : <FaChevronRight color="#adb5bd" />}
    </div>
  );

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#f8f9fa",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* Left Panel: Controls & File Tree */}
      <div
        ref={leftRef}
        style={{
          width: "350px",
          minWidth: "250px",
          background: "#ffffff",
          borderRight: "1px solid #e9ecef",
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
          boxShadow: "2px 0 10px rgba(0,0,0,0.02)",
          overflow: "hidden", // Prevent overflow on parent
        }}
      >
        {/* Header - Fixed */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid #e9ecef",
          flexShrink: 0,
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img
              src="/assets/PromptByCode.png"
              alt="PromptByCode Logo"
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "0",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
              }}
            />
            <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, color: "#ffffff" }}>
              PromptByCode
            </h1>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          {/* Upload Section */}
          <SectionHeader title="Upload Files" isOpen={isUploadOpen} onClick={() => setIsUploadOpen(!isUploadOpen)} />

          {isUploadOpen && (
            <div style={{ padding: "20px 24px", flexShrink: 0, animation: "fadeIn 0.3s ease" }}>
              <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${dragActive ? "#007bff" : "#dee2e6"}`,
                  borderRadius: "12px",
                  padding: "30px 20px",
                  textAlign: "center",
                  background: dragActive ? "rgba(0,123,255,0.05)" : "#f8f9fa",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                <FaCloudUploadAlt size={40} color={dragActive ? "#007bff" : "#adb5bd"} style={{ marginBottom: "10px" }} />
                <p style={{ margin: "0 0 15px 0", color: "#495057", fontWeight: 500 }}>
                  Drag & Drop folder here
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                  <label className="btn-secondary">
                    <FaFolderOpen /> Folder
                    <input
                      type="file"
                      webkitdirectory="true"
                      directory=""
                      multiple
                      onChange={handleFileInput}
                      style={{ display: "none" }}
                    />
                  </label>
                  <label className="btn-secondary">
                    <FaFile /> Files
                    <input
                      type="file"
                      multiple
                      onChange={handleFileInput}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* File Tree Section */}
          <SectionHeader title="Project Files" isOpen={isFilesOpen} onClick={() => setIsFilesOpen(!isFilesOpen)} />

          {isFilesOpen && (
            <div style={{ overflowY: "auto", padding: "10px 12px", animation: "fadeIn 0.3s ease" }}>
              <div style={{ padding: "0 12px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", color: "#adb5bd", fontWeight: 600 }}>
                  {selectedFiles.length > 0 ? `${selectedFiles.length} selected` : "No files selected"}
                </span>
              </div>
              <FileTree
                tree={fileTree}
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
              />
            </div>
          )}

          {/* Custom Prompt Section - Collapsible */}
          <SectionHeader title="Custom Instruction" isOpen={isPromptOpen} onClick={() => setIsPromptOpen(!isPromptOpen)} />

          {isPromptOpen && (
            <div style={{ padding: "0.1rem 0.6rem", animation: "fadeIn 0.3s ease" }}>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., Explain the authentication logic..."
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ced4da",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  resize: "vertical",
                  minHeight: "80px",
                  background: "#f8f9fa",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
          )}
        </div>

        {/* Action Bar - Fixed at bottom */}
        <div style={{ padding: "20px 24px", borderTop: "1px solid #f1f3f5", background: "#ffffff", flexShrink: 0 }}>
          <button
            onClick={handleSummarize}
            disabled={loading || selectedFiles.length === 0}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#a5d8ff" : "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: loading || selectedFiles.length === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              transition: "transform 0.1s ease, box-shadow 0.2s ease",
            }}
            onMouseDown={(e) => !loading && (e.currentTarget.style.transform = "scale(0.98)")}
            onMouseUp={(e) => !loading && (e.currentTarget.style.transform = "scale(1)")}
          >
            {loading ? <FaSpinner className="spin" /> : null}
            {loading ? "Processing..." : "Generate Context"}
          </button>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={startResize}
        style={{
          width: "4px",
          background: "transparent",
          cursor: "col-resize",
          zIndex: 20,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "1px", height: "100%", background: "#e9ecef" }}></div>
      </div>

      {/* Right Panel: Output */}
      <div style={{ flex: 1, background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}> {/* Dark Blue Theme */}

        {/* Content Area */}
        <div style={{ flex: 1, overflow: "auto", position: "relative" }}>

          {/* Sticky Toolbar */}
          <div style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            padding: "15px 30px",
            background: "rgba(15, 23, 42, 0.9)", // Dark blue glassmorphism
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(59, 130, 246, 0.2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: "70px",
            transition: "all 0.3s ease",
          }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600, color: "#e0e0e0" }}>Generated Context</h2>
            {summary && (
              <button
                onClick={handleCopy}
                style={{
                  padding: "8px 16px",
                  background: copying ? "#10b981" : "rgba(59, 130, 246, 0.2)",
                  border: `1px solid ${copying ? "#10b981" : "rgba(59, 130, 246, 0.4)"}`,
                  color: "#ffffff",
                  borderRadius: "20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                  animation: "float 3s ease-in-out infinite",
                }}
              >
                {copying ? <FaCheck /> : <FaCopy />}
                {copying ? "Copied!" : "Copy"}
              </button>
            )}
          </div>

          <div style={{ padding: "0" }}>
            {error && (
              <div style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid #ef4444",
                color: "#fca5a5",
                padding: "16px",
                margin: "20px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}>
                <FaExclamationCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {!summary && !loading && !error && (
              <div style={{
                height: "60vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                opacity: 0.8,
              }}>
                <div style={{ fontSize: "4rem", marginBottom: "20px" }}>✨</div>
                <p style={{ fontSize: "1.1rem" }}>Select files and click "Generate Context" to see the magic.</p>
              </div>
            )}

            {summary && (
              <div style={{
                background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)", // Matching dark blue
                minHeight: "100%",
              }}>
                <pre
                  className="language-javascript"
                  style={{
                    margin: 0,
                    padding: "20px 30px",
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                    fontFamily: "'Fira Code', monospace",
                    background: "transparent",
                    color: "#e2e8f0",
                    textShadow: "none",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: Prism.highlight(summary, Prism.languages.javascript, "javascript"),
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Styles & Animations */}
      <style>{`
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #ffffff;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          color: #495057;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-secondary:hover {
          background: #f8f9fa;
          border-color: #adb5bd;
          color: #212529;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        /* Helium Balloon Float Animation */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #000;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          borderRadius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}