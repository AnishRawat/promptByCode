import React, { useState } from "react";
import { FaFolder, FaFolderOpen, FaFileCode, FaFile, FaFileAlt, FaChevronRight, FaChevronDown } from "react-icons/fa";

// Recursive component for rendering tree nodes
const TreeNode = ({ node, selectedFiles, setSelectedFiles, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Determine if the current node is selected
  const isSelected = selectedFiles.some((f) => f.id === node.id);

  const handleNodeClick = (e) => {
    e.stopPropagation();
    if (node.isFile) {
      // Toggle file selection
      if (isSelected) {
        setSelectedFiles(selectedFiles.filter((f) => f.id !== node.id));
      } else {
        setSelectedFiles([...selectedFiles, node]);
      }
    } else {
      // Toggle folder open/close state
      setIsOpen(!isOpen);
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "js":
      case "jsx":
      case "ts":
      case "tsx":
        return <FaFileCode style={{ color: "#f7df1e" }} />;
      case "py":
        return <FaFileCode style={{ color: "#306998" }} />;
      case "java":
        return <FaFileCode style={{ color: "#f89820" }} />;
      case "c":
      case "cpp":
        return <FaFileCode style={{ color: "#00599c" }} />;
      case "html":
      case "htm":
        return <FaFileCode style={{ color: "#e34c26" }} />;
      case "css":
        return <FaFileCode style={{ color: "#264de4" }} />;
      case "json":
        return <FaFileCode style={{ color: "#4f4f4f" }} />;
      case "md":
        return <FaFileAlt style={{ color: "#6c757d" }} />;
      default:
        return <FaFile style={{ color: "#a0a8b4" }} />;
    }
  };

  return (
    <div style={{ userSelect: "none" }}>
      <div
        onClick={handleNodeClick}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "6px 12px",
          paddingLeft: `${level * 20 + 12}px`,
          cursor: "pointer",
          transition: "all 0.2s ease",
          background: isSelected ? "rgba(0, 123, 255, 0.1)" : "transparent",
          borderLeft: isSelected ? "3px solid #007bff" : "3px solid transparent",
          color: isSelected ? "#007bff" : "#495057",
        }}
        onMouseEnter={(e) => {
          if (!isSelected) e.currentTarget.style.background = "#f8f9fa";
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.background = "transparent";
        }}
      >
        <span style={{ marginRight: "8px", display: "flex", alignItems: "center", fontSize: "0.9em", color: "#adb5bd" }}>
          {!node.isFile && (
            isOpen ? <FaChevronDown /> : <FaChevronRight />
          )}
          {node.isFile && <span style={{ width: "14px" }}></span>} {/* Spacer for alignment */}
        </span>

        <span style={{ marginRight: "10px", display: "flex", alignItems: "center", fontSize: "1.2em" }}>
          {node.isFile
            ? getFileIcon(node.name)
            : isOpen
              ? <FaFolderOpen style={{ color: "#ffd43b" }} />
              : <FaFolder style={{ color: "#ffd43b" }} />}
        </span>

        <span style={{ fontSize: "0.95em", fontWeight: isSelected ? 600 : 400 }}>{node.name}</span>
      </div>

      {/* Recursively render children */}
      {!node.isFile && isOpen && node.children && (
        <div style={{ overflow: "hidden" }}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id || child.path}
              node={child}
              selectedFiles={selectedFiles}
              setSelectedFiles={setSelectedFiles}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main FileTree component
const FileTree = ({ tree, selectedFiles, setSelectedFiles }) => {
  if (!tree || !tree.children || tree.children.length === 0) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "#adb5bd" }}>
        <div style={{ fontSize: "3em", marginBottom: "10px", opacity: 0.5 }}>📂</div>
        <p style={{ margin: 0, fontSize: "0.95em" }}>No files loaded</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "10px 0" }}>
      {tree.children.map((node) => (
        <TreeNode
          key={node.id || node.path}
          node={node}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
        />
      ))}
    </div>
  );
};

export default FileTree;