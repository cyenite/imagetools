import React, { createContext, useContext, useState, useEffect } from 'react';

const themes = {
    light: {
        name: 'light',
        background: '#f8fafc',
        surface: '#ffffff',
        primary: '#2563eb',
        secondary: '#1e40af',
        text: '#1e293b',
        border: 'rgba(229, 231, 235, 0.5)',
        cardBg: '#ffffff',
        navBg: 'rgba(255, 255, 255, 0.8)'
    },
    dark: {
        name: 'dark',
        background: '#0f172a',
        surface: '#1e293b',
        primary: '#3b82f6',
        secondary: '#60a5fa',
        text: '#f1f5f9',
        border: 'rgba(51, 65, 85, 0.5)',
        cardBg: '#1e293b',
        navBg: 'rgba(15, 23, 42, 0.8)'
    },
    night: {
        name: 'night',
        background: '#18181b',
        surface: '#27272a',
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        text: '#fafafa',
        border: 'rgba(63, 63, 70, 0.5)',
        cardBg: '#27272a',
        navBg: 'rgba(24, 24, 27, 0.8)'
    },
    sunset: {
        name: 'sunset',
        background: '#1f1720',
        surface: '#2d1b2d',
        primary: '#f97316',
        secondary: '#fb923c',
        text: '#fafafa',
        border: 'rgba(88, 28, 85, 0.5)',
        cardBg: '#2d1b2d',
        navBg: 'rgba(31, 23, 32, 0.8)'
    }
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return themes[savedTheme] || themes.light;
    });

    useEffect(() => {
        const root = document.documentElement;
        Object.entries(theme).forEach(([key, value]) => {
            if (key !== 'name') {
                root.style.setProperty(`--${key}`, value);
            }
        });
        document.documentElement.setAttribute('data-theme', theme.name);
    }, [theme]);

    const changeTheme = (themeName) => {
        if (themes[themeName]) {
            setTheme(themes[themeName]);
            localStorage.setItem('theme', themeName);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, changeTheme, themes }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}