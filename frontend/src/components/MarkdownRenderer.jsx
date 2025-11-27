import React from 'react';

const MarkdownRenderer = ({ content, currentTheme, activeTheme }) => {
    // Simple markdown parser for basic formatting
    const parseMarkdown = (text) => {
        const lines = text.split('\n');
        const elements = [];
        let codeBlock = null;
        let listItems = [];
        let inList = false;

        const flushList = () => {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`list-${elements.length}`} style={{
                        marginLeft: '20px',
                        marginBottom: '16px',
                        color: currentTheme.text
                    }}>
                        {listItems}
                    </ul>
                );
                listItems = [];
                inList = false;
            }
        };

        lines.forEach((line, index) => {
            // Code block handling
            if (line.trim().startsWith('```')) {
                if (codeBlock === null) {
                    codeBlock = { lang: line.trim().slice(3) || 'text', lines: [] };
                } else {
                    // End code block
                    elements.push(
                        <div key={`code-${index}`} style={{ marginBottom: '16px' }}>
                            <pre style={{
                                background: activeTheme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.05)',
                                padding: '16px',
                                borderRadius: '8px',
                                overflowX: 'auto',
                                border: `1px solid ${currentTheme.inputBorder}`,
                                color: currentTheme.text,
                                fontSize: '0.9em',
                                fontFamily: "'Fira Code', 'Consolas', monospace"
                            }}>
                                {codeBlock.lines.join('\n')}
                            </pre>
                        </div>
                    );
                    codeBlock = null;
                }
                return;
            }

            if (codeBlock !== null) {
                codeBlock.lines.push(line);
                return;
            }

            // Heading detection
            if (line.startsWith('# ')) {
                flushList();
                elements.push(
                    <h1 key={`h1-${index}`} style={{
                        fontSize: '1.8em',
                        fontWeight: 700,
                        marginBottom: '16px',
                        marginTop: '24px',
                        background: currentTheme.buttonBg,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        {line.slice(2)}
                    </h1>
                );
            } else if (line.startsWith('## ')) {
                flushList();
                elements.push(
                    <h2 key={`h2-${index}`} style={{
                        fontSize: '1.5em',
                        fontWeight: 600,
                        marginBottom: '12px',
                        marginTop: '20px',
                        color: currentTheme.text,
                        borderBottom: `2px solid ${currentTheme.panelBorder}`,
                        paddingBottom: '8px'
                    }}>
                        {line.slice(3)}
                    </h2>
                );
            } else if (line.startsWith('### ')) {
                flushList();
                elements.push(
                    <h3 key={`h3-${index}`} style={{
                        fontSize: '1.2em',
                        fontWeight: 600,
                        marginBottom: '8px',
                        marginTop: '16px',
                        color: currentTheme.text
                    }}>
                        {line.slice(4)}
                    </h3>
                );
            } else if (line.match(/^[-*]\s/)) {
                // List item
                inList = true;
                const text = line.slice(2);
                const formatted = formatInlineMarkdown(text);
                listItems.push(
                    <li key={`li-${index}`} style={{
                        marginBottom: '8px',
                        color: currentTheme.text,
                        lineHeight: '1.6'
                    }}>
                        {formatted}
                    </li>
                );
            } else if (line.match(/^\d+\.\s/)) {
                // Numbered list
                flushList();
                const text = line.replace(/^\d+\.\s/, '');
                const formatted = formatInlineMarkdown(text);
                elements.push(
                    <p key={`num-${index}`} style={{
                        marginBottom: '8px',
                        color: currentTheme.text,
                        lineHeight: '1.6'
                    }}>
                        <strong>{line.match(/^\d+/)[0]}.</strong> {formatted}
                    </p>
                );
            } else if (line.trim() === '') {
                flushList();
                elements.push(<div key={`space-${index}`} style={{ height: '8px' }} />);
            } else {
                flushList();
                // Regular paragraph
                const formatted = formatInlineMarkdown(line);
                elements.push(
                    <p key={`p-${index}`} style={{
                        marginBottom: '12px',
                        color: currentTheme.text,
                        lineHeight: '1.6'
                    }}>
                        {formatted}
                    </p>
                );
            }
        });

        flushList();
        return elements;
    };

    const formatInlineMarkdown = (text) => {
        const parts = [];
        let currentText = text;
        let key = 0;

        // Bold
        currentText = currentText.replace(/\*\*(.+?)\*\*/g, (match, p1) => {
            parts.push(<strong key={`bold-${key++}`} style={{ color: currentTheme.text, fontWeight: 700 }}>{p1}</strong>);
            return `__PLACEHOLDER_${parts.length - 1}__`;
        });

        // Inline code
        currentText = currentText.replace(/`([^`]+)`/g, (match, p1) => {
            parts.push(
                <code key={`code-${key++}`} style={{
                    background: activeTheme === 'dark' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontFamily: "'Fira Code', monospace",
                    fontSize: '0.9em',
                    color: activeTheme === 'dark' ? '#a78bfa' : '#6366f1'
                }}>
                    {p1}
                </code>
            );
            return `__PLACEHOLDER_${parts.length - 1}__`;
        });

        // Italic
        currentText = currentText.replace(/\*(.+?)\*/g, (match, p1) => {
            parts.push(<em key={`italic-${key++}`} style={{ fontStyle: 'italic', color: currentTheme.textMuted }}>{p1}</em>);
            return `__PLACEHOLDER_${parts.length - 1}__`;
        });

        // Reconstruct the text with React elements
        const result = [];
        const segments = currentText.split(/(__PLACEHOLDER_\d+__)/);

        segments.forEach((segment, index) => {
            const match = segment.match(/__PLACEHOLDER_(\d+)__/);
            if (match) {
                result.push(parts[parseInt(match[1])]);
            } else if (segment) {
                result.push(<span key={`text-${index}`}>{segment}</span>);
            }
        });

        return result.length > 0 ? result : text;
    };

    return (
        <div style={{
            color: currentTheme.text,
            fontSize: '0.95rem'
        }}>
            {parseMarkdown(content)}
        </div>
    );
};

export default MarkdownRenderer;
