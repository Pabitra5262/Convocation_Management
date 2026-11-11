import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DICTIONARIES, LANGUAGES, type Lang } from "./translations";

/* Ported from hims-ui-new i18n/I18nProvider.tsx. Keys are the English strings, so a missing translation stays English. */

export type TranslateFn = (text: string, vars?: Record<string, string | number>) => string;

interface I18nValue {
    lang: Lang;
    setLang: (lang: Lang) => void;
    t: TranslateFn;
}

const STORAGE_KEY = "arf.lang";

const interpolate = (text: string, vars?: Record<string, string | number>) =>
    vars ? text.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`)) : text;

/** Without a provider (e.g. a component used on its own) text simply stays English. */
const FALLBACK: I18nValue = { lang: "en", setLang: () => undefined, t: (text, vars) => interpolate(text, vars) };
const I18nContext = createContext<I18nValue>(FALLBACK);

const initialLang = (): Lang => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
        if (stored && LANGUAGES.some((l) => l.code === stored)) return stored;
    } catch {
        /* storage unavailable */
    }
    return "en";
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
    const [lang, setLang] = useState<Lang>(initialLang);

    useEffect(() => {
        document.documentElement.lang = lang;
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch {
            /* storage unavailable */
        }
    }, [lang]);

    const t = useCallback<TranslateFn>((text, vars) => interpolate(DICTIONARIES[lang][text] ?? text, vars), [lang]);
    const value = useMemo<I18nValue>(() => ({ lang, setLang, t }), [lang, t]);
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useI18n = () => useContext(I18nContext);
/** Shorthand: `const t = useT()`. */
// eslint-disable-next-line react-refresh/only-export-components
export const useT = () => useContext(I18nContext).t;
