import { useEffect, useState } from "react";
import Modal from "@/shared/components/ui/Modal/Modal";
import { useT } from "@/shared/i18n/I18nProvider";

/* Ported from hims-ui-new components/layout/ShortcutsSheet.tsx. Styles: src/shared/styles/shell.css */

const isMac = typeof navigator !== "undefined" && /mac/i.test(navigator.platform);
const MOD = isMac ? "⌘" : "Ctrl";

const GROUPS: { title: string; items: { keys: string[]; label: string }[] }[] = [
    {
        title: "Navigation",
        items: [
            { keys: [MOD, "K"], label: "Search pages and applications" },
            { keys: [MOD, "."], label: "Open all applications" },
            { keys: ["/"], label: "Search the menu" },
            { keys: ["?"], label: "Show this list of shortcuts" },
        ],
    },
    {
        title: "Lists and dialogs",
        items: [
            { keys: ["↑", "↓"], label: "Move through search results" },
            { keys: ["Enter"], label: "Open the highlighted result" },
            { keys: ["Esc"], label: "Close a dialog, panel or search" },
        ],
    },
];

const typing = (el: EventTarget | null) =>
    el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

/** Press ? anywhere (outside a text field) to see the keyboard shortcuts; / jumps to the menu search. */
const ShortcutsSheet = () => {
    const t = useT();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
            if (e.key === "?") {
                e.preventDefault();
                setOpen((o) => !o);
            } else if (e.key === "/") {
                const input = document.getElementById("menu-search");
                if (input) {
                    e.preventDefault();
                    input.focus();
                }
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);

    return (
        <Modal isOpen={open} onClose={() => setOpen(false)} title={t("Keyboard shortcuts")} size="sm">
            <div className="shortcuts">
                {GROUPS.map((g) => (
                    <section key={g.title} aria-label={t(g.title)}>
                        <h3 className="shortcuts__title">{t(g.title)}</h3>
                        <dl className="shortcuts__list">
                            {g.items.map((i) => (
                                <div key={i.label} className="shortcuts__row">
                                    <dt>{t(i.label)}</dt>
                                    <dd>
                                        {i.keys.map((k) => (
                                            <kbd key={k} className="shortcuts__key">{k}</kbd>
                                        ))}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </section>
                ))}
            </div>
        </Modal>
    );
};

export default ShortcutsSheet;
