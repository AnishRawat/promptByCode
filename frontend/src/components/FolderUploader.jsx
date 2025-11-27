import React, { useState, useEffect, useRef, useCallback } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";

import { useTheme } from "../hooks/useTheme";
import { useFileProcessing } from "../hooks/useFileProcessing";
import { useSummarization } from "../hooks/useSummarization";
import Sidebar from "./Layout/Sidebar";
import MainContent from "./Layout/MainContent";

import { useMediaQuery } from "../hooks/useMediaQuery";

export default function FolderUploader() {
  // Hooks
  const { theme, setTheme, activeTheme, currentTheme } = useTheme();
  const {
    fileTree,
    selectedFiles,
    setSelectedFiles,
    loading: fileLoading,
    error: fileError,
    isReadingFiles,
    dragActive,
    handleFileInput,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop
  } = useFileProcessing();
  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
    customPrompt,
    setCustomPrompt,
    handleSummarize
  } = useSummarization();

  // Local State
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

  // Debug: Log when model changes
  useEffect(() => {
    console.log("📍 FolderUploader: selectedModel changed to:", selectedModel);
  }, [selectedModel]);
  const containerRef = useRef();
  const leftRef = useRef();
  const isResizing = useRef(false);

  // Responsive State
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);

  // Update sidebar open state when switching between mobile/desktop
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  // Resize Logic
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
  };

  const stopResize = () => {
    isResizing.current = false;
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
  };

  useEffect(() => {
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
    return () => {
      document.removeEventListener("mousemove", resize);
      document.removeEventListener("mouseup", stopResize);
    };
  }, []);

  // Create a stable reference to handleSummarize with current selectedModel
  const onGenerateClick = useCallback(() => {
    console.log("🎬 onGenerateClick called with model:", selectedModel);
    handleSummarize(selectedFiles, selectedModel);
  }, [handleSummarize, selectedFiles, selectedModel]);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: currentTheme.bg,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        flexDirection: "row", // Always row, sidebar will be absolute on mobile
        position: "relative"
      }}
    >
      <Sidebar
        fileTree={fileTree}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        customPrompt={customPrompt}
        setCustomPrompt={setCustomPrompt}
        handleFileInput={handleFileInput}
        handleDragEnter={handleDragEnter}
        handleDragLeave={handleDragLeave}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        dragActive={dragActive}
        handleSummarize={onGenerateClick}
        loading={summaryLoading || fileLoading}
        currentTheme={currentTheme}
        activeTheme={activeTheme}
        leftRef={leftRef}
        isMobile={isMobile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Resize Handle (Desktop Only) */}
      {!isMobile && (
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
          <div style={{ width: "1px", height: "100%", background: currentTheme.panelBorder }}></div>
        </div>
      )}

      <MainContent
        summary={summary}
        loading={summaryLoading}
        error={summaryError || fileError}
        theme={theme}
        setTheme={setTheme}
        activeTheme={activeTheme}
        currentTheme={currentTheme}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        isMobile={isMobile}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Global Styles */}
      <style>{`
        .btn-modern {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .btn-modern:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.4);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
}