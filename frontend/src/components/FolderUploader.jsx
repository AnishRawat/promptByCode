import React, { useState, useRef, useEffect } from "react";
import FileTree from "./FileTree.jsx";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import { FaCloudUploadAlt, FaCopy, FaCheck, FaExclamationCircle, FaSpinner, FaFolderOpen, FaFile, FaChevronDown, FaChevronRight, FaFileCode } from "react-icons/fa";

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

  const [pendingFiles, setPendingFiles] = useState(null);
  const [isReadingFiles, setIsReadingFiles] = useState(false); // Loading state for upload
  const [isSummarizing, setIsSummarizing] = useState(false); // Loading state for summarization

  const [showSelectedDrawer, setShowSelectedDrawer] = useState(false); // Drawer state

  const containerRef = useRef();
  const leftRef = useRef();
  const isResizing = useRef(false);

  // Bottom Panel State
  const [bottomPanelHeight, setBottomPanelHeight] = useState(200); // Default height
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
  const isResizingBottom = useRef(false);

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
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
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
        for (let j = 0; j < parts.length; j++) {
          const part = parts[j];
          let node = current.children.find((c) => c.name === part);

          if (!node) {
            const isFile = j === parts.length - 1;
            node = {
              name: part,
              children: [],
              isFile: isFile,
              path: parts.slice(0, j + 1).join("/"),
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

        // Yield to main thread every 10 files to keep UI responsive
        if (i % 10 === 0) await new Promise(resolve => setTimeout(resolve, 0));
      }
      setFileTree(newTree);
      // Auto-expand file tree section and collapse upload section
      setIsFilesOpen(true);
      setIsUploadOpen(false);
    } catch (err) {
      console.error("Error processing files:", err);
      setError("Failed to process uploaded files.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsReadingFiles(true);
      // Small delay to allow UI to render loader
      setTimeout(() => {
        processFiles(files).then(() => setIsReadingFiles(false));
      }, 100);
    }
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
      setIsReadingFiles(true);
      setTimeout(() => {
        processFiles(e.dataTransfer.files).then(() => setIsReadingFiles(false));
      }, 100);
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
    setIsSummarizing(true); // Show full screen loader
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
      // Send to backend (Vercel API route)
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedFiles: payload, customPrompt: customPrompt }),
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
      setIsSummarizing(false);
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



  const resize = (e) => {
    if (isResizing.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      if (newWidth > 250 && newWidth < containerRect.width - 400) {
        leftRef.current.style.width = `${newWidth}px`;
      }
    }
    if (isResizingBottom.current) {
      const newHeight = window.innerHeight - e.clientY;
      if (newHeight > 40 && newHeight < window.innerHeight - 100) {
        setBottomPanelHeight(newHeight);
      }
    }
  };

  const stopResize = () => {
    isResizing.current = false;
    isResizingBottom.current = false;
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
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

  const SectionHeader = ({ title, isOpen, onClick, badge }) => (
    <div
      onClick={onClick}
      style={{
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        userSelect: "none",
        background: isOpen ? "#f1f5f9" : "#f8f9fa", // Darker when open
        borderBottom: "2px solid #cbd5e1", // Thicker border
        borderTop: "2px solid #cbd5e1", // Thicker border
        transition: "background 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {title}
        </h3>
        {badge && (
          <span style={{
            background: "#3b82f6", color: "white", fontSize: "0.75rem", padding: "2px 8px",
            borderRadius: "12px", fontWeight: 600
          }}>
            {badge}
          </span>
        )}
      </div>
      {isOpen ? <FaChevronDown color="#64748b" /> : <FaChevronRight color="#94a3b8" />}
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
          background: "#cbd5e1", // 20% more grayish (was #e2e8f0)
          borderRight: "2px solid #cbd5e1", // Thicker border
          display: "flex",
          flexDirection: "column",
          zIndex: 10,
          boxShadow: "2px 0 10px rgba(0,0,0,0.02)",
          overflow: "visible", // Allow drawer to stick out
          position: "relative"
        }}
      >
        {/* Header - Fixed with Watermark */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid #e9ecef",
          flexShrink: 0,
          background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center" // Center the text
        }}>
          {/* Watermark Logo */}
          <img
            src="/assets/PromptByCode.png"
            alt=""
            style={{
              position: "absolute",
              height: "120%", // Big but contained vertically
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              opacity: 0.15, // Fading in effect
              pointerEvents: "none",
              filter: "grayscale(100%) brightness(200%)" // Make it white-ish to blend with gradient
            }}
          />

          <h1 style={{
            margin: 0,
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#ffffff",
            position: "relative",
            zIndex: 2,
            textShadow: "0 2px 4px rgba(0,0,0,0.2)"
          }}>
            PromptByCode
          </h1>
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
                  color: "#1e293b", // Dark text for visibility
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
          )}

          {/* Project Files Section */}
          <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <SectionHeader
              title="Project Files"
              isOpen={isFilesOpen}
              onClick={() => setIsFilesOpen(!isFilesOpen)}
            />

            {isFilesOpen && (
              <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
                {/* Main Tree View */}
                <div style={{
                  height: "100%",
                  overflowY: "auto",
                  padding: "10px 12px",
                  background: "#cbd5e1" // Match panel background
                }}>
                  <FileTree
                    tree={fileTree}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar - Fixed at bottom */}
        <div style={{ padding: "20px 24px", borderTop: "1px solid #94a3b8", background: "#cbd5e1", flexShrink: 0 }}>
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

        {/* Bottom Panel for Selected Files */}
        {selectedFiles.length > 0 && (
          <div style={{
            height: isBottomPanelOpen ? `${bottomPanelHeight}px` : "40px",
            background: "#0f172a", // Darker (was #1e293b)
            borderTop: "2px solid #334155",
            display: "flex",
            flexDirection: "column",
            transition: isResizingBottom.current ? "none" : "height 0.3s ease",
            position: "relative",
            zIndex: 60
          }}>
            {/* Resize Handle */}
            <div
              onMouseDown={(e) => {
                e.stopPropagation();
                isResizingBottom.current = true;
                document.body.style.cursor = "ns-resize";
                document.body.style.userSelect = "none";
              }}
              style={{
                position: "absolute",
                top: "-5px",
                left: 0,
                width: "100%",
                height: "10px",
                cursor: "ns-resize",
                zIndex: 70,
                background: "transparent"
              }}
            />

            {/* Header */}
            <div
              onClick={() => setIsBottomPanelOpen(!isBottomPanelOpen)}
              style={{
                padding: "10px 20px",
                background: "#334155",
                color: "#f8fafc",
                fontSize: "0.9rem",
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                borderBottom: isBottomPanelOpen ? "1px solid #475569" : "none"
              }}
            >
              <span>Selected Files ({selectedFiles.length})</span>
              {isBottomPanelOpen ? <FaChevronDown /> : <FaChevronRight style={{ transform: "rotate(-90deg)" }} />}
            </div>

            {/* Content */}
            {isBottomPanelOpen && (
              <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
                {selectedFiles.map((file, idx) => (
                  <div key={idx} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 12px", background: "#0f172a", border: "1px solid #334155", borderRadius: "6px",
                    marginBottom: "6px"
                  }}>
                    <span style={{
                      color: "#e2e8f0", fontSize: "0.85rem",
                      whiteSpace: "normal", // Allow wrapping
                      wordBreak: "break-all", // Break long words
                      marginRight: "10px"
                    }}>
                      {file.name}
                    </span>
                    <button
                      onClick={() => setSelectedFiles(prev => prev.filter(f => f !== file))}
                      style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", padding: "4px" }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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

      {/* Right Panel: Generated Context */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#112240", position: "relative", overflow: "hidden" }}>

        {/* Watermark for Generated Context */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60%",
          height: "60%",
          backgroundImage: "url('/assets/PromptByCode.png')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "contain",
          opacity: 0.03, // Highly transparent (Highle opace?)
          pointerEvents: "none",
          zIndex: 0
        }} />

        {/* Header */}
        <div style={{
          padding: "15px 30px",
          background: "#112240", // Match body
          borderBottom: "1px solid #233554",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          zIndex: 1
        }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600, color: "#f8fafc" }}>Generated Context</h2>
          {summary && (
            <button
              onClick={handleCopy}
              style={{
                padding: "8px 16px",
                background: copying ? "#10b981" : "#e0f2fe",
                border: `1px solid ${copying ? "#10b981" : "#90cdf4"}`,
                color: copying ? "#ffffff" : "#2563eb",
                borderRadius: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.9rem",
                fontWeight: 600,
                transition: "all 0.2s ease",
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                animation: "float 3s ease-in-out infinite",
              }}
            >
              {copying ? <FaCheck /> : <FaCopy />}
              {copying ? "Copied!" : "Copy"}
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "30px", overflowY: "auto", position: "relative", zIndex: 1 }}>
          {error && (
            <div style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid #ef4444",
              color: "#b91c1c",
              padding: "16px",
              margin: "0 0 20px 0",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}>
              <FaExclamationCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#cbd5e1" }}>
              <FaSpinner className="spin" size={40} color="#3b82f6" />
              <p style={{ marginTop: "20px", fontWeight: 500 }}>Generating summary...</p>
            </div>
          ) : summary ? (
            <div style={{ maxWidth: "900px", margin: "0 auto" }}>
              <div style={{
                background: "#0f172a", // Dark card
                padding: "30px",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.1)",
                border: "1px solid #334155",
                overflowX: "auto" // Allow horizontal scroll if needed
              }}>
                <pre style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word", // Force wrap long words
                  fontFamily: "'Fira Code', 'Consolas', monospace",
                  fontSize: "0.9rem",
                  lineHeight: "1.6",
                  color: "#e2e8f0", // Light text
                  margin: 0
                }}>
                  <code className="language-markdown">{summary}</code>
                </pre>
              </div>
            </div>
          ) : (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#94a3b8",
              textAlign: "center", maxWidth: "500px", margin: "0 auto"
            }}>
              <FaFileCode size={60} color="#334155" style={{ marginBottom: "20px" }} />
              <h3 style={{ margin: "0 0 10px 0", color: "#cbd5e1" }}>Ready to Summarize</h3>
              <p style={{ color: "#94a3b8" }}>Select files from the left panel and click "Generate Context" to create a comprehensive summary.</p>
            </div>
          )}
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