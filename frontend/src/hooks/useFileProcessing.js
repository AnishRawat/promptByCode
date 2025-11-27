import { useState } from 'react';

export const useFileProcessing = () => {
    const [fileTree, setFileTree] = useState({ name: "Root", children: [], isDirectory: true });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isReadingFiles, setIsReadingFiles] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const processFiles = async (files) => {
        if (!files || files.length === 0) return;

        setLoading(true);
        setError("");
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
            setTimeout(() => {
                processFiles(files).then(() => setIsReadingFiles(false));
            }, 100);
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
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

    return {
        fileTree,
        selectedFiles,
        setSelectedFiles,
        loading,
        error,
        isReadingFiles,
        dragActive,
        handleFileInput,
        handleDragEnter,
        handleDragLeave,
        handleDragOver,
        handleDrop
    };
};
