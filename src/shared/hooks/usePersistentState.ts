import { useCallback, useState } from "react";

/** useState that is saved in localStorage under `key` (falls back to `initial` when storage is unavailable). */
export const usePersistentState = <T,>(key: string, initial: T) => {
    const [value, setValue] = useState<T>(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw === null ? initial : (JSON.parse(raw) as T);
        } catch {
            return initial;
        }
    });

    const set = useCallback(
        (next: T | ((prev: T) => T)) => {
            setValue((prev) => {
                const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
                try {
                    localStorage.setItem(key, JSON.stringify(resolved));
                } catch {
                    /* storage unavailable */
                }
                return resolved;
            });
        },
        [key],
    );

    return [value, set] as const;
};

export default usePersistentState;
