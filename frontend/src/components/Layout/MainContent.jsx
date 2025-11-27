import React, { useState } from 'react';
import { FaCopy, FaCheck, FaSun, FaMoon, FaCloud, FaExclamationCircle, FaSpinner, FaFileCode, FaBars } from 'react-icons/fa';
import ModelSelector from '../UI/ModelSelector.jsx';
import MarkdownRenderer from '../MarkdownRenderer.jsx';

const MainContent = ({
    summary,
    loading,
    error,
    theme,
    setTheme,
    activeTheme,
    currentTheme,
    selectedModel,
    setSelectedModel,
    isMobile,
    toggleSidebar
}) => {
    const [copying, setCopying] = useState(false);
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

    const handleCopy = () => {
        if (!summary) return;
        navigator.clipboard.writeText(summary);
        setCopying(true);
        setTimeout(() => setCopying(false), 2000);
    };

    return (
        <div style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: activeTheme === 'dark' ? "rgba(15, 23, 42, 0.6)" : "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(20px)",
            position: "relative",
            overflow: "hidden"
        }}>

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
                opacity: 0.03,
                pointerEvents: "none",
                zIndex: 0,
                filter: activeTheme === 'dark' ? "invert(1)" : "none"
            }} />

            {/* Header */}
            <div style={{
                padding: "15px 30px",
                background: currentTheme.panelBg,
                borderBottom: `1px solid ${currentTheme.panelBorder}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                position: "relative",
                zIndex: 50,
                gap: "12px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {isMobile && (
                        <button
                            onClick={toggleSidebar}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: currentTheme.text,
                                cursor: "pointer",
                                padding: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                        >
                            <FaBars size={20} />
                        </button>
                    )}
                    <h4 style={{
                        margin: 0,
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        color: currentTheme.text,
                        transition: "color 0.3s ease",
                        display: isMobile ? "none" : "block" // Hide on mobile to prevent overlap
                    }}>
                        Generated Context
                    </h4>
                </div>

                {/* Center: Model Selector */}
                <ModelSelector
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                    isDropdownOpen={isModelDropdownOpen}
                    setIsDropdownOpen={setIsModelDropdownOpen}
                />

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {summary && (
                        <button
                            onClick={handleCopy}
                            style={{
                                padding: "8px 16px",
                                background: copying ? "#10b981" : currentTheme.inputBg,
                                border: `1px solid ${copying ? "#10b981" : currentTheme.inputBorder}`,
                                color: copying ? "#ffffff" : currentTheme.text,
                                borderRadius: "20px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "0.9rem",
                                fontWeight: 600,
                                transition: "all 0.2s ease",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                            }}
                        >
                            {copying ? <FaCheck /> : <FaCopy />}
                            {copying ? "Copied!" : "Copy"}
                        </button>
                    )}

                    {/* Theme Switcher - Icon Only */}
                    <button
                        onClick={() => {
                            // Cycle: light -> dark -> auto -> light
                            if (theme === 'light') setTheme('dark');
                            else if (theme === 'dark') setTheme('auto');
                            else setTheme('light');
                        }}
                        style={{
                            width: "auto",
                            height: "36px",
                            padding: "0 12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            background: currentTheme.inputBg,
                            border: `1px solid ${currentTheme.inputBorder}`,
                            borderRadius: "10px",
                            cursor: "pointer",
                            color: currentTheme.text,
                            transition: "all 0.2s ease",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
                        }}
                        title={`Current: ${theme === 'auto' ? 'Default' : theme.charAt(0).toUpperCase() + theme.slice(1)}`}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
                        }}
                    >
                        {theme === 'light' ? <FaSun size={16} /> : theme === 'dark' ? <FaMoon size={16} /> : <FaCloud size={16} />}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: "30px", overflowY: "auto", position: "relative", zIndex: 1 }}>
                {error ? (
                    <div style={{
                        // background: "rgba(255, 255, 255, 1)",
                        background: "rgba(255, 255, 255, 0.15)",
                        backdropFilter: "blur(12px)",
                        borderRadius: "10px",
                        // filter: "blur(5px)",
                        border: "1px solid #f97d09ff",
                        color: "#f97d09ff",
                        padding: "16px",
                        margin: "0 0 20px 0",
                        // borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        position: "relative",
                    }}>
                        <FaExclamationCircle size={20} />
                        <span>There was some error while generating summary</span>
                    </div>
                ) :

                    loading ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: currentTheme.textMuted }}>
                            <FaSpinner className="spin" size={40} color="#3b82f6" />
                            <p style={{ marginTop: "20px", fontWeight: 500 }}>Generating summary...</p>
                        </div>
                    ) : summary ? (
                        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
                            <div style={{
                                background: currentTheme.panelBg,
                                padding: "30px",
                                borderRadius: "12px",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.1)",
                                border: `1px solid ${currentTheme.panelBorder}`,
                                overflowX: "auto"
                            }}>
                                <MarkdownRenderer content={summary} currentTheme={currentTheme} activeTheme={activeTheme} />
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: currentTheme.textMuted,
                            textAlign: "center", maxWidth: "500px", margin: "0 auto"
                        }}>
                            <FaFileCode size={60} color={currentTheme.text} style={{ marginBottom: "20px" }} />
                            <h3 style={{ margin: "0 0 10px 0", color: currentTheme.text }}>Ready to Summarize</h3>
                            <p style={{ color: currentTheme.textMuted }}>Select files from the left panel and click "Generate Context" to create a comprehensive summary.</p>
                        </div>
                    )}
            </div>
        </div>
    );
};

export default MainContent;
