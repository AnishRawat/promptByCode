import { useState, useEffect } from 'react';

export const useTheme = () => {
    const getInitialTheme = () => localStorage.getItem('theme') || 'auto';
    const [theme, setTheme] = useState(getInitialTheme);
    const [serverTheme, setServerTheme] = useState(null);

    // Determine actual theme to use
    const getActiveTheme = () => {
        if (theme === 'auto') {
            if (serverTheme) return serverTheme;
            const hour = new Date().getHours();
            return hour >= 6 && hour < 18 ? 'light' : 'dark';
        }
        return theme;
    };
    const activeTheme = getActiveTheme();

    const fetchWeatherTheme = async (lat, lon) => {
        try {
            const url = `/api/weather-theme?lat=${lat}&lon=${lon}`;
            const response = await fetch(url);
            const data = await response.json();
            console.log("Weather Theme Response:", data);
            if (data.success && data.theme) {
                setServerTheme(data.theme);
            }
        } catch (err) {
            console.error('Weather API Error:', err);
        }
    };

    useEffect(() => {
        if (theme === 'auto') {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    fetchWeatherTheme(latitude, longitude);
                    const interval = setInterval(
                        () => fetchWeatherTheme(latitude, longitude),
                        30 * 60 * 1000 // every 30 minutes
                    );
                    return () => clearInterval(interval);
                },
                (err) => {
                    console.warn('Geolocation failed, falling back to time-based theme', err);
                }
            );
        }
    }, [theme]);

    useEffect(() => localStorage.setItem('theme', theme), [theme]);

    const themes = {
        dark: {
            bg: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
            panelBg: "rgba(255, 255, 255, 0.03)",
            panelBorder: "rgba(255, 255, 255, 0.1)",
            text: "rgba(255, 255, 255, 0.9)",
            textMuted: "rgba(255, 255, 255, 0.6)",
            sectionBg: "rgba(255, 255, 255, 0.06)",
            inputBg: "rgba(255, 255, 255, 0.04)",
            inputBorder: "rgba(255, 255, 255, 0.08)",
            buttonBg: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            buttonText: "#ffffff",
            hoverBg: "rgba(255, 255, 255, 0.08)",
            selectedBg: "rgba(139, 92, 246, 0.2)",
            selectedBorder: "#8b5cf6",
            selectedText: "#a78bfa"
        },
        light: {
            bg: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%)",
            panelBg: "rgba(255, 255, 255, 1)",
            panelBorder: "rgba(148, 163, 184, 0.5)",
            text: "#020617",
            textMuted: "#475569",
            sectionBg: "rgba(241, 245, 249, 0.6)",
            inputBg: "#ffffff",
            inputBorder: "#e2e8f0",
            buttonBg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
            buttonText: "#ffffff",
            hoverBg: "rgba(0, 0, 0, 0.04)",
            selectedBg: "rgba(59, 130, 246, 0.1)",
            selectedBorder: "#3b82f6",
            selectedText: "#2563eb"
        },
        snow: {
            bg: "linear-gradient(135deg, #e0f7fa 0%, #ffffff 50%, #e3f2fd 100%)",
            panelBg: "rgba(255, 255, 255, 0.85)",
            panelBorder: "rgba(176, 190, 197, 0.3)",
            text: "#263238",
            textMuted: "#546e7a",
            sectionBg: "rgba(236, 239, 241, 0.7)",
            inputBg: "#ffffff",
            inputBorder: "#cfd8dc",
            buttonBg: "linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)",
            buttonText: "#ffffff",
            hoverBg: "rgba(0, 188, 212, 0.05)",
            selectedBg: "rgba(0, 188, 212, 0.1)",
            selectedBorder: "#00bcd4",
            selectedText: "#0097a7"
        },
        rain: {
            bg: "linear-gradient(135deg, #263238 0%, #37474f 50%, #455a64 100%)",
            panelBg: "rgba(0, 0, 0, 0.2)",
            panelBorder: "rgba(255, 255, 255, 0.1)",
            text: "#eceff1",
            textMuted: "#b0bec5",
            sectionBg: "rgba(0, 0, 0, 0.15)",
            inputBg: "rgba(0, 0, 0, 0.2)",
            inputBorder: "rgba(255, 255, 255, 0.15)",
            buttonBg: "linear-gradient(135deg, #546e7a 0%, #455a64 100%)",
            buttonText: "#ffffff",
            hoverBg: "rgba(255, 255, 255, 0.05)",
            selectedBg: "rgba(84, 110, 122, 0.3)",
            selectedBorder: "#78909c",
            selectedText: "#eceff1"
        },
        cloudy: {
            bg: "linear-gradient(135deg, #cfd8dc 0%, #eceff1 50%, #b0bec5 100%)",
            panelBg: "rgba(255, 255, 255, 0.6)",
            panelBorder: "rgba(0, 0, 0, 0.1)",
            text: "#37474f",
            textMuted: "#607d8b",
            sectionBg: "rgba(255, 255, 255, 0.4)",
            inputBg: "#ffffff",
            inputBorder: "#b0bec5",
            buttonBg: "linear-gradient(135deg, #78909c 0%, #607d8b 100%)",
            buttonText: "#ffffff",
            hoverBg: "rgba(96, 125, 139, 0.1)",
            selectedBg: "rgba(96, 125, 139, 0.15)",
            selectedBorder: "#607d8b",
            selectedText: "#455a64"
        },
        sunny: {
            bg: "linear-gradient(135deg, #fffde7 0%, #fff9c4 50%, #fff59d 100%)",
            panelBg: "rgba(255, 255, 255, 0.9)",
            panelBorder: "rgba(253, 216, 53, 0.3)",
            text: "#f57f17",
            textMuted: "#f9a825",
            sectionBg: "rgba(255, 253, 231, 0.8)",
            inputBg: "#ffffff",
            inputBorder: "#fff176",
            buttonBg: "linear-gradient(135deg, #fbc02d 0%, #f9a825 100%)",
            buttonText: "#ffffff",
            hoverBg: "rgba(251, 192, 45, 0.1)",
            selectedBg: "rgba(251, 192, 45, 0.15)",
            selectedBorder: "#fbc02d",
            selectedText: "#f57f17"
        }
        // ...other themes like snow, rain, cloudy, sunny
    };
    const currentTheme = themes[activeTheme];

    return { theme, setTheme, activeTheme, currentTheme };
};
