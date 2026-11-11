import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { createInitialData, type AuditLog, type SsbData } from "./data";
import { ROLES, roleKeyOf, type RoleKey } from "./roles";

/* In-memory SSB Portal state shared by every page (SSB_Portal.html DEMO_STATE). Nothing is sent to a server. */

interface SsbStore {
    data: SsbData;
    /** Change the data: the callback receives a copy it may edit in place. */
    update: (change: (draft: SsbData) => void) => void;
    /** Adds an entry at the top of the audit log. */
    addLog: (entry: Omit<AuditLog, "id" | "dt">) => void;
    reset: () => void;
}

const StoreContext = createContext<SsbStore | null>(null);

export const SsbProvider = ({ children }: { children: ReactNode }) => {
    const [data, setData] = useState<SsbData>(createInitialData);

    const update = useCallback((change: (draft: SsbData) => void) => {
        setData((prev) => {
            const draft = structuredClone(prev);
            change(draft);
            return draft;
        });
    }, []);

    const addLog = useCallback(
        (entry: Omit<AuditLog, "id" | "dt">) =>
            update((d) => {
                d.auditLogs.unshift({ id: `AUD-${Date.now()}`, dt: new Date().toISOString().slice(0, 16).replace("T", " "), ...entry });
            }),
        [update],
    );

    const reset = useCallback(() => setData(createInitialData()), []);
    const value = useMemo(() => ({ data, update, addLog, reset }), [data, update, addLog, reset]);
    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSsb = (): SsbStore => {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error("useSsb must be used inside <SsbProvider>");
    return ctx;
};

/* ---- Active role (owned by MainLayout, switched from the header) ---------------------------- */

interface RoleValue {
    /** Header name of the role, e.g. "Centre Superintendent". */
    role: string;
    roleKey: RoleKey;
    setRole: (role: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const RoleContext = createContext<RoleValue>({ role: ROLES[0].label, roleKey: ROLES[0].key, setRole: () => undefined });

// eslint-disable-next-line react-refresh/only-export-components
export const useRole = (): RoleValue => useContext(RoleContext);

// eslint-disable-next-line react-refresh/only-export-components
export const makeRoleValue = (role: string, setRole: (role: string) => void): RoleValue => ({ role, roleKey: roleKeyOf(role), setRole });
