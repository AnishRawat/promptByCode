import React, { useRef, useEffect } from 'react';
import { FaBolt, FaMagic, FaChevronDown } from 'react-icons/fa';

const ModelSelector = ({ selectedModel, setSelectedModel, isDropdownOpen, setIsDropdownOpen }) => {
    const dropdownRef = useRef(null);

    // Define available models
    const models = [
        {
            id: "llama-3.3-70b-versatile",
            name: "Llama 3.3 70B",
            provider: "groq",
            desc: "Fast & Versatile",
            icon: <FaBolt size={14} color="#fff" />,
            color: "linear-gradient(135deg, #f55036 0%, #ff7e5f 100%)"
        },
        {
            id: "llama-3.1-8b-instant",
            name: "Llama 3.1 8B Instant",
            provider: "groq",
            desc: "Ultra Fast • Low Cost",
            icon: <FaBolt size={14} color="#fff" />,
            color: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
        },
        {
            id: "qwen/qwen3-32b",
            name: "Qwen 3 32B",
            provider: "groq",
            desc: "Creative • Great for rewriting",
            icon: <FaBolt size={14} color="#fff" />,
            color: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)"
        },
        {
            id: "gemini-2.5-flash",
            name: "Gemini 2.5 Flash",
            provider: "gemini",
            desc: "Fast & Efficient",
            icon: <FaMagic size={14} color="#fff" />,
            color: "linear-gradient(135deg, #4285f4 0%, #34a853 50%, #fbbc04 100%)"
        },
        {
            id: "gemini-2.5-pro",
            name: "Gemini 2.5 Pro",
            provider: "gemini",
            desc: "Complex Reasoning",
            icon: <FaMagic size={14} color="#fff" />,
            color: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)"
        }
    ];

    // Find current model object or default to first
    const currentModel = models.find(m => m.id === selectedModel) || models.find(m => m.id === "gemini-2.5-flash") || models[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setIsDropdownOpen]);

    return (
        <div style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10
        }}>
            <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 14px",
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "#ffffff",
                        boxShadow: "0 2px 12px rgba(139, 92, 246, 0.4)",
                        minWidth: "180px", // Increased width for longer names
                        justifyContent: "space-between"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(139, 92, 246, 0.5)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 2px 12px rgba(139, 92, 246, 0.4)";
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "5px",
                            background: currentModel.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem"
                        }}>
                            {currentModel.icon}
                        </div>
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>
                            {currentModel.name}
                        </span>
                    </div>
                    <FaChevronDown size={11} style={{ transition: "transform 0.2s", transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                    <div style={{
                        position: "absolute",
                        top: "calc(100% + 8px)", // Open downwards
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(30, 41, 59, 0.98)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "12px",
                        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
                        minWidth: "280px",
                        overflow: "hidden",
                        zIndex: 1000,
                        maxHeight: "400px",
                        overflowY: "auto"
                    }}>
                        {models.map((model, index) => (
                            <React.Fragment key={model.id}>
                                {index > 0 && models[index - 1].provider !== model.provider && (
                                    <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.05)", margin: "4px 0" }} />
                                )}
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(`🎯 ModelSelector: User clicked ${model.name}`);
                                        setSelectedModel(model.id);
                                        setIsDropdownOpen(false);
                                    }}
                                    style={{
                                        padding: "12px 16px",
                                        cursor: "pointer",
                                        background: selectedModel === model.id ? "rgba(139, 92, 246, 0.15)" : "transparent",
                                        borderLeft: selectedModel === model.id ? "3px solid #8b5cf6" : "3px solid transparent",
                                        transition: "all 0.2s ease",
                                        color: "#f8fafc"
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(139, 92, 246, 0.1)"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = selectedModel === model.id ? "rgba(139, 92, 246, 0.15)" : "transparent"}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                                        <div style={{
                                            width: "24px",
                                            height: "24px",
                                            borderRadius: "6px",
                                            background: model.color,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "0.9rem",
                                            flexShrink: 0
                                        }}>
                                            {model.icon}
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{model.name}</span>
                                    </div>
                                    <div style={{ fontSize: "0.75rem", color: "#94a3b8", paddingLeft: "36px", lineHeight: "1.3" }}>
                                        {model.desc}
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModelSelector;
