import React, { createContext, useContext, useEffect, useLayoutEffect, useState, useMemo, useCallback } from 'react';

type Theme = 'light' | 'dark';

/* Theme settings ported from hims-ui-new theme/ThemeProvider.tsx. Each option is written to <html> as a data
   attribute or CSS variable; the matching rules live in src/shared/styles/theme-settings.css. */
export type Density = 'compact' | 'comfortable' | 'spacious';
export type FontSize = 'small' | 'default' | 'large';
export type ClickAnimations = 'off' | 'subtle' | 'expressive';
export type HoverEffect = 'off' | 'subtle' | 'standard' | 'expressive';
export type CampusSlice = 'left' | 'centre' | 'right';

export interface ThemeSettings {
    density: Density;
    fontSize: FontSize;
    clickAnimations: ClickAnimations;
    hoverEffect: HoverEffect;
    headerShadow: boolean;
    reduceMotion: boolean;
    /** Campus night sidebar: scrim strength, 60 to 100 %. */
    campusDarkness: number;
    /** Campus night sidebar: photo blur, 0 to 100 % (100 % = 20 px; the default 10 % = 2 px). */
    campusBlur: number;
    campusSlice: CampusSlice;
}

interface ThemeContextType extends ThemeSettings {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    setDensity: (d: Density) => void;
    setFontSize: (f: FontSize) => void;
    setClickAnimations: (a: ClickAnimations) => void;
    setHoverEffect: (h: HoverEffect) => void;
    setHeaderShadow: (on: boolean) => void;
    setReduceMotion: (on: boolean) => void;
    setCampusDarkness: (n: number) => void;
    setCampusBlur: (n: number) => void;
    setCampusSlice: (s: CampusSlice) => void;
    resetCustomizations: () => void;
}

const SETTINGS_KEY = 'arf.theme.settings';

const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    density: 'comfortable',
    fontSize: 'default',
    clickAnimations: 'subtle',
    hoverEffect: 'standard',
    headerShadow: true,
    reduceMotion: false,
    campusDarkness: 100,
    campusBlur: 10,
    campusSlice: 'centre',
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, Math.round(n)));
const oneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
    allowed.includes(value as T) ? (value as T) : fallback;

const loadSettings = (): ThemeSettings => {
    try {
        const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') as Partial<ThemeSettings>;
        const d = DEFAULT_THEME_SETTINGS;
        return {
            density: oneOf(raw.density, ['compact', 'comfortable', 'spacious'], d.density),
            fontSize: oneOf(raw.fontSize, ['small', 'default', 'large'], d.fontSize),
            clickAnimations: oneOf(raw.clickAnimations, ['off', 'subtle', 'expressive'], d.clickAnimations),
            hoverEffect: oneOf(raw.hoverEffect, ['off', 'subtle', 'standard', 'expressive'], d.hoverEffect),
            headerShadow: typeof raw.headerShadow === 'boolean' ? raw.headerShadow : d.headerShadow,
            reduceMotion: raw.reduceMotion === true,
            campusDarkness: clamp(Number(raw.campusDarkness ?? d.campusDarkness) || d.campusDarkness, 60, 100),
            campusBlur: clamp(Number(raw.campusBlur ?? d.campusBlur) || 0, 0, 100),
            campusSlice: oneOf(raw.campusSlice, ['left', 'centre', 'right'], d.campusSlice),
        };
    } catch {
        return DEFAULT_THEME_SETTINGS;
    }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });
    const [settings, setSettings] = useState<ThemeSettings>(loadSettings);

    // Layout effect: the class must be on <html> before the theme reveal captures the new frame.
    useLayoutEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        const root = document.documentElement;
        root.dataset.density = settings.density;
        root.dataset.font = settings.fontSize;
        root.dataset.anim = settings.clickAnimations;
        root.dataset.spot = settings.hoverEffect;
        root.dataset.headerShadow = settings.headerShadow ? 'on' : 'off';
        root.dataset.motion = settings.reduceMotion ? 'reduced' : 'system';
        root.style.setProperty('--cn', String(settings.campusDarkness / 100));
        root.style.setProperty('--cn-blur', `${settings.campusBlur * 0.2}px`);
        root.style.setProperty('--cn-pos', { left: '0%', centre: '55%', right: '100%' }[settings.campusSlice]);
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch {
            /* storage unavailable: settings still apply for this session */
        }
    }, [settings]);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    }, []);

    const patch = useCallback((p: Partial<ThemeSettings>) => setSettings((s) => ({ ...s, ...p })), []);

    const contextValue = useMemo<ThemeContextType>(
        () => ({
            ...settings,
            theme,
            toggleTheme,
            setTheme,
            setDensity: (density) => patch({ density }),
            setFontSize: (fontSize) => patch({ fontSize }),
            setClickAnimations: (clickAnimations) => patch({ clickAnimations }),
            setHoverEffect: (hoverEffect) => patch({ hoverEffect }),
            setHeaderShadow: (headerShadow) => patch({ headerShadow }),
            setReduceMotion: (reduceMotion) => patch({ reduceMotion }),
            setCampusDarkness: (n) => patch({ campusDarkness: clamp(n, 60, 100) }),
            setCampusBlur: (n) => patch({ campusBlur: clamp(n, 0, 100) }),
            setCampusSlice: (campusSlice) => patch({ campusSlice }),
            resetCustomizations: () => setSettings(DEFAULT_THEME_SETTINGS),
        }),
        [settings, theme, toggleTheme, patch],
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
