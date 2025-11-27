import React from 'react';
import { FaChevronDown } from 'react-icons/fa';

const SectionHeader = ({ title, isOpen, onClick, badge, currentTheme }) => (
    <div
        onClick={onClick}
        style={{
            padding: "14px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            userSelect: "none",
            background: isOpen ? currentTheme.sectionBg : "rgba(0, 0, 0, 0.02)",
            borderBottom: `1px solid ${currentTheme.panelBorder}`,
            borderTop: `1px solid ${currentTheme.panelBorder}`,
            transition: "all 0.2s ease",
        }}
    >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h3 style={{ margin: 0, fontSize: "0.85rem", fontWeight: 700, color: currentTheme.text, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {title}
            </h3>
            {badge && (
                <span style={{
                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    color: "white",
                    fontSize: "0.7rem",
                    padding: "3px 8px",
                    borderRadius: "10px",
                    fontWeight: 700,
                    boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)"
                }}>
                    {badge}
                </span>
            )}
        </div>
        <FaChevronDown
            size={14}
            color={currentTheme.textMuted}
            style={{
                transition: "transform 0.2s",
                transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)"
            }}
        />
    </div>
);

export default SectionHeader;
