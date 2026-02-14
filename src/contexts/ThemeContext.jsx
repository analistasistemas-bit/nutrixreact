import React, { useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContextInstance';

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Verifica preferência salva ou do sistema
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('nutrixo-theme');
            if (savedTheme) {
                return savedTheme;
            }
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        // Remove a classe antiga para garantir limpeza
        root.classList.remove('light', 'dark');
        // Adiciona a classe atual
        root.classList.add(theme);
        // Salva no localStorage
        localStorage.setItem('nutrixo-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

