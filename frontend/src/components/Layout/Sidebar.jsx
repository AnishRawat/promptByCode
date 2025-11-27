import React, { useState } from 'react';
import { FaCloudUploadAlt, FaFolderOpen, FaFile, FaSpinner, FaTimes } from 'react-icons/fa';
import FileTree from '../FileTree.jsx';
import SectionHeader from '../UI/SectionHeader.jsx';
import SelectedFilesPanel from '../UI/SelectedFilesPanel.jsx';

const Sidebar = ({
    fileTree,
    selectedFiles,
    setSelectedFiles,
    customPrompt,
    setCustomPrompt,
    handleFileInput,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    dragActive,
    handleSummarize,
    loading,
    currentTheme,
    activeTheme,
    leftRef,
    isMobile,
    isOpen,
    onClose
}) => {
    const [isUploadOpen, setIsUploadOpen] = useState(true);
    const [isFilesOpen, setIsFilesOpen] = useState(true);
    const [isPromptOpen, setIsPromptOpen] = useState(false);

    // If mobile and not open, don't render or render hidden
    // Better to use CSS transform for smooth transition

    const sidebarStyle = isMobile ? {
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: "85%",
        maxWidth: "320px",
        zIndex: 50,
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease-in-out",
        boxShadow: isOpen ? "0 0 40px rgba(0,0,0,0.5)" : "none"
    } : {
        width: "380px",
        minWidth: "280px",
        position: "relative",
        zIndex: 10,
        boxShadow: activeTheme === 'dark' ? "4px 0 24px rgba(0,0,0,0.2)" : "4px 0 24px rgba(0,0,0,0.08)",
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(2px)",
                        zIndex: 40
                    }}
                />
            )}

            <div
                ref={leftRef}
                style={{
                    ...sidebarStyle,
                    background: currentTheme.panelBg,
                    backdropFilter: "blur(10px)",
                    borderRight: `1px solid ${currentTheme.panelBorder}`,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "visible",
                }}
            >
                {/* Header - Modern with Logo */}
                <div style={{
                    padding: "28px 24px",
                    borderBottom: `1px solid ${currentTheme.panelBorder}`,
                    flexShrink: 0,
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                }}>
                    {/* Watermark Pattern */}
                    <div style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
                        pointerEvents: "none"
                    }} />

                    <div style={{
                        padding: "10px 24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: `1px solid ${currentTheme.panelBorder}`,
                        transition: "all 0.3s ease"
                    }}>
                        <div>
                            <h1 style={{
                                margin: 0,
                                fontSize: "1.5rem",
                                fontWeight: 800,
                                background: "linear-gradient(to right, #ffffff, #f0f9ff)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                                position: "relative",
                                zIndex: 2,
                                letterSpacing: "-0.02em",
                                whiteSpace: "nowrap"
                            }}>
                                ⚡ PromptByCode
                            </h1>
                            <p style={{
                                margin: "4px 0 0 0",
                                fontSize: "0.85rem",
                                color: "rgba(255, 255, 255, 0.8)",
                                fontWeight: 500,
                                position: "relative",
                                zIndex: 2
                            }}>
                                Transform code into context
                            </p>
                        </div>
                        {/* Close button removed as per user request */}
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div style={{ flex: 1, overflowY: "auto", position: "relative", display: "flex", flexDirection: "column" }}>
                    <div style={{ flexShrink: 0 }}>
                        <SectionHeader title="Upload Files" isOpen={isUploadOpen} onClick={() => setIsUploadOpen(!isUploadOpen)} currentTheme={currentTheme} />

                        {isUploadOpen && (
                            <div style={{ padding: "24px", animation: "fadeIn 0.3s ease" }}>
                                <div
                                    onDragEnter={handleDragEnter}
                                    onDragLeave={handleDragLeave}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    style={{
                                        border: `2px dashed ${dragActive ? "#8b5cf6" : currentTheme.panelBorder}`,
                                        borderRadius: "16px",
                                        padding: "40px 20px",
                                        textAlign: "center",
                                        background: dragActive ? "rgba(139, 92, 246, 0.1)" : currentTheme.inputBg,
                                        backdropFilter: "blur(5px)",
                                        transition: "all 0.3s ease",
                                        position: "relative",
                                    }}
                                >
                                    <FaCloudUploadAlt
                                        size={48}
                                        color={dragActive ? "#a78bfa" : currentTheme.textMuted}
                                        style={{ marginBottom: "16px", transition: "all 0.2s" }}
                                    />
                                    <p style={{
                                        margin: "0 0 20px 0",
                                        color: dragActive ? "#c4b5fd" : currentTheme.text,
                                        fontWeight: 600,
                                        fontSize: "0.95rem"
                                    }}>
                                        Drag & Drop folder here
                                    </p>
                                    <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                                        <label style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "6px",
                                            padding: "10px 20px",
                                            background: activeTheme === 'dark' ? "rgba(255, 255, 255, 0.08)" : "#ffffff",
                                            border: `1px solid ${currentTheme.inputBorder}`,
                                            borderRadius: "10px",
                                            color: currentTheme.text,
                                            fontSize: "0.9rem",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = "#8b5cf6";
                                                e.currentTarget.style.color = "#8b5cf6";
                                                e.currentTarget.style.transform = "translateY(-1px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = currentTheme.inputBorder;
                                                e.currentTarget.style.color = currentTheme.text;
                                                e.currentTarget.style.transform = "translateY(0)";
                                            }}
                                        >
                                            <FaFolderOpen style={{ marginRight: "6px" }} /> Folder
                                            <input
                                                type="file"
                                                webkitdirectory="true"
                                                directory="true"
                                                onChange={handleFileInput}
                                                style={{ display: "none" }}
                                            />
                                        </label>
                                        <label style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "6px",
                                            padding: "10px 20px",
                                            background: activeTheme === 'dark' ? "rgba(255, 255, 255, 0.08)" : "#ffffff",
                                            border: `1px solid ${currentTheme.inputBorder}`,
                                            borderRadius: "10px",
                                            color: currentTheme.text,
                                            fontSize: "0.9rem",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.borderColor = "#8b5cf6";
                                                e.currentTarget.style.color = "#8b5cf6";
                                                e.currentTarget.style.transform = "translateY(-1px)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.borderColor = currentTheme.inputBorder;
                                                e.currentTarget.style.color = currentTheme.text;
                                                e.currentTarget.style.transform = "translateY(0)";
                                            }}
                                        >
                                            <FaFile style={{ marginRight: "6px" }} /> Files
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

                        <SectionHeader title="Custom Instruction" isOpen={isPromptOpen} onClick={() => setIsPromptOpen(!isPromptOpen)} currentTheme={currentTheme} />

                        {isPromptOpen && (
                            <div style={{ padding: "10px", animation: "fadeIn 0.3s ease" }}>
                                <textarea
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    placeholder="e.g., Explain the authentication logic..."
                                    style={{
                                        width: "100%",
                                        padding: "16px",
                                        borderRadius: "16px",
                                        border: `1px solid ${currentTheme.inputBorder}`,
                                        fontSize: "0.95rem",
                                        fontFamily: "inherit",
                                        resize: "vertical",
                                        minHeight: "120px",
                                        background: currentTheme.inputBg,
                                        color: currentTheme.text,
                                        outline: "none",
                                        boxSizing: "border-box",
                                        transition: "all 0.3s ease",
                                        lineHeight: "1.5",
                                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = "#8b5cf6";
                                        e.target.style.background = activeTheme === 'dark' ? "rgba(255, 255, 255, 0.06)" : "#ffffff";
                                        e.target.style.boxShadow = "0 0 0 4px rgba(139, 92, 246, 0.1)";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = currentTheme.inputBorder;
                                        e.target.style.background = currentTheme.inputBg;
                                        e.target.style.boxShadow = "inset 0 2px 4px rgba(0,0,0,0.02)";
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <SectionHeader title="Project Files" isOpen={isFilesOpen} onClick={() => setIsFilesOpen(!isFilesOpen)} badge={fileTree.children.length > 0 ? `${fileTree.children.length} items` : null} currentTheme={currentTheme} />

                    {isFilesOpen && (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100px" }}>
                            <div style={{
                                flex: 1,
                                position: "relative",
                                margin: "10px",
                                borderRadius: "16px",
                                overflow: "hidden",
                                border: `1px solid ${currentTheme.inputBorder}`,
                                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.05)"
                            }}>
                                <div style={{
                                    position: "absolute",
                                    inset: 0,
                                    overflow: "auto",
                                    padding: "10px 12px",
                                    background: currentTheme.inputBg,
                                    transition: "all 0.3s ease"
                                }}>
                                    <FileTree
                                        tree={fileTree}
                                        selectedFiles={selectedFiles}
                                        setSelectedFiles={setSelectedFiles}
                                        themeColors={currentTheme}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Bar - Fixed at bottom */}
                <div style={{ padding: "20px 24px", borderTop: `1px solid ${currentTheme.panelBorder}`, background: currentTheme.panelBg, flexShrink: 0 }}>
                    <button
                        onClick={handleSummarize}
                        disabled={loading || selectedFiles.length === 0}
                        style={{
                            width: "100%",
                            padding: "12px",
                            background: loading ? "#94a3b8" : currentTheme.buttonBg,
                            color: currentTheme.buttonText,
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

                <SelectedFilesPanel selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} currentTheme={currentTheme} />
            </div>
        </>
    );
};

export default Sidebar;
