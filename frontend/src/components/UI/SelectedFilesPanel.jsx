import React, { useState, useRef } from 'react';
import { FaChevronDown, FaChevronRight, FaFileCode, FaTimes } from 'react-icons/fa';

const SelectedFilesPanel = ({ selectedFiles, setSelectedFiles, currentTheme }) => {
    const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
    const [isBottomPanelOpen, setIsBottomPanelOpen] = useState(true);
    const isResizingBottom = useRef(false);

    if (selectedFiles.length === 0) return null;

    return (
        <div style={{
            height: isBottomPanelOpen ? `${bottomPanelHeight}px` : "40px",
            background: currentTheme.panelBg,
            backdropFilter: "blur(10px)",
            borderTop: `3px solid ${currentTheme.panelBorder}`,
            display: "flex",
            flexDirection: "column",
            transition: isResizingBottom.current ? "none" : "height 0.3s ease",
            position: "relative",
            zIndex: 60,
            boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1)"
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
                    padding: "8px 16px",
                    background: currentTheme.sectionBg,
                    color: currentTheme.text,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    borderBottom: isBottomPanelOpen ? `1px solid ${currentTheme.panelBorder}` : "none"
                }}
            >
                <span>Selected Files ({selectedFiles.length})</span>
                {isBottomPanelOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} style={{ transform: "rotate(-90deg)" }} />}
            </div>

            {/* Content */}
            {isBottomPanelOpen && (
                <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
                    {selectedFiles.map((file, idx) => (
                        <div key={idx} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "6px 10px",
                            background: currentTheme.inputBg,
                            border: `1px solid ${currentTheme.inputBorder}`,
                            borderRadius: "6px",
                            marginBottom: "4px"
                        }}>
                            <span style={{
                                color: currentTheme.text, fontSize: "0.85rem",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                marginRight: "10px",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                            }}>
                                <FaFileCode size={12} color={currentTheme.textMuted} />
                                {file.name}
                            </span>
                            <button
                                onClick={() => setSelectedFiles(prev => prev.filter(f => f !== file))}
                                style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", padding: "4px", display: "flex" }}
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SelectedFilesPanel;
