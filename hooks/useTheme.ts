/**
 * useTheme Hook
 * 
 * Manages theme state with system preference detection and manual override.
 */

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface UseThemeReturn {
    /** Current theme setting */
    theme: Theme;
    /** Actual resolved theme (light or dark) */
    resolvedTheme: 'light' | 'dark';
    /** Toggle between light and dark */
    toggleTheme: () => void;
    /** Set specific theme */
    setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'steamlib_theme';

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): Theme {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored;
    }
    return 'system';
}

export function useTheme(): UseThemeReturn {
    // Initialize with 'system' to match server-side rendering
    const [theme, setThemeState] = useState<Theme>('system');
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
    const [mounted, setMounted] = useState(false);

    // Initial setup effect
    useEffect(() => {
        setMounted(true);
        setSystemTheme(getSystemTheme());
        const stored = getStoredTheme();
        setThemeState(stored);
    }, []);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handler = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        const resolved = theme === 'system' ? systemTheme : theme;

        root.classList.remove('light', 'dark');
        if (theme !== 'system') {
            root.classList.add(resolved);
        }
    }, [theme, systemTheme]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
    }, []);

    const toggleTheme = useCallback(() => {
        const resolved = theme === 'system' ? systemTheme : theme;
        setTheme(resolved === 'dark' ? 'light' : 'dark');
    }, [theme, systemTheme, setTheme]);

    const resolvedTheme = theme === 'system' ? systemTheme : theme;

    return {
        theme,
        resolvedTheme,
        toggleTheme,
        setTheme,
    };
}
