import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CornerDownLeft, Search, SearchX, type LucideIcon } from "lucide-react";
import { useT } from "@/shared/i18n/I18nProvider";

export interface SearchItem {
    id: string;
    label: string;
    group: string;
    description?: string;
    icon?: LucideIcon;
}

export interface GlobalSearchProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: SearchItem[];
    /** Shown first while the query is empty (e.g. recently visited pages). */
    recent?: SearchItem[];
    onSelect: (item: SearchItem) => void;
    placeholder?: string;
}

/** Wraps the part of `text` that matches `query` in <mark>. */
export const Highlight = ({ text, query }: { text: string; query: string }): ReactNode => {
    const q = query.trim();
    const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
    if (i < 0) return text;
    return (
        <>
            {text.slice(0, i)}
            <mark className="hdr-mark">{text.slice(i, i + q.length)}</mark>
            {text.slice(i + q.length)}
        </>
    );
};

/** Search palette. Opens from the header search icon or Ctrl/⌘ + K; ↑ ↓ to move, Enter to open, Esc to close. */
export const GlobalSearch = ({ open, onOpenChange, items, recent = [], onSelect, placeholder = "Search pages and applications…" }: GlobalSearchProps) => {
    const t = useT();
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const returnFocus = useRef<HTMLElement | null>(null);
    const listId = useId();

    // Ctrl/⌘ + K toggles the palette from anywhere.
    const openRef = useRef(open);
    useEffect(() => {
        openRef.current = open;
    }, [open]);
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                onOpenChange(!openRef.current);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onOpenChange]);

    // Focus the input on open, lock page scroll, give focus back on close.
    useEffect(() => {
        if (!open) return;
        returnFocus.current = document.activeElement as HTMLElement | null;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        inputRef.current?.focus();
        return () => {
            document.body.style.overflow = overflow;
            returnFocus.current?.focus?.();
        };
    }, [open]);

    const close = () => {
        onOpenChange(false);
        setQuery("");
        setActive(0);
    };

    const sections = useMemo(() => {
        const q = query.trim().toLowerCase();
        const hits = q ? items.filter((i) => `${i.label} ${i.description ?? ""}`.toLowerCase().includes(q)) : [...recent, ...items];
        const groups = new Map<string, SearchItem[]>();
        hits.forEach((h) => groups.set(h.group, [...(groups.get(h.group) ?? []), h]));
        return [...groups].map(([title, list]) => ({ title, items: list.slice(0, q ? 5 : 6) }));
    }, [items, recent, query]);

    const flat = sections.flatMap((s) => s.items);
    const choose = (item: SearchItem) => {
        onSelect(item);
        close();
    };

    if (!open) return null;

    let counter = -1;
    return createPortal(
        <div className="hdr-search">
            <div className="hdr-search__backdrop" onMouseDown={close} aria-hidden />
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Search"
                className="hdr-search__dialog"
                onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setActive((a) => Math.min(a + 1, flat.length - 1));
                    } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setActive((a) => Math.max(a - 1, 0));
                    } else if (e.key === "Enter" && flat[active]) {
                        e.preventDefault();
                        choose(flat[active]);
                    } else if (e.key === "Escape") {
                        e.preventDefault();
                        close();
                    }
                }}
            >
                <div className="hdr-search__bar">
                    <Search size={20} />
                    <input
                        ref={inputRef}
                        role="combobox"
                        aria-expanded
                        aria-controls={listId}
                        aria-activedescendant={flat[active] ? `${listId}-${flat[active].id}` : undefined}
                        aria-label="Search"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setActive(0);
                        }}
                        placeholder={t(placeholder)}
                    />
                    <kbd className="hdr-kbd">Esc</kbd>
                </div>

                <div id={listId} role="listbox" aria-label="Search results" className="hdr-search__results">
                    {flat.length === 0 ? (
                        <div className="hdr-empty" role="status">
                            <SearchX size={28} />
                            <p className="hdr-empty__title">{query ? `No results for “${query}”` : "Start typing to search"}</p>
                            {query && <p>Check the spelling or try a broader term.</p>}
                        </div>
                    ) : (
                        sections.map((s) => (
                            <div key={s.title} role="group" aria-label={s.title} className="mb-1">
                                <p className="hdr-search__group">{t(s.title)}</p>
                                {s.items.map((it) => {
                                    counter += 1;
                                    const idx = counter;
                                    const isActive = idx === active;
                                    const ItemIcon = it.icon ?? Search;
                                    return (
                                        <div
                                            key={`${s.title}-${it.id}`}
                                            id={`${listId}-${it.id}`}
                                            role="option"
                                            aria-selected={isActive}
                                            tabIndex={-1}
                                            onMouseEnter={() => setActive(idx)}
                                            onClick={() => choose(it)}
                                            onKeyDown={(e) => e.key === "Enter" && choose(it)}
                                            ref={(el) => {
                                                if (el && isActive) el.scrollIntoView({ block: "nearest" });
                                            }}
                                            className={`hdr-search__option ${isActive ? "is-active" : ""}`}
                                        >
                                            <span className="hdr-search__option-icon"><ItemIcon size={16} /></span>
                                            <span className="min-w-0 flex-1">
                                                <span className="hdr-search__option-label"><Highlight text={it.label} query={query} /></span>
                                                {it.description && (
                                                    <span className="hdr-search__option-desc"><Highlight text={it.description} query={query} /></span>
                                                )}
                                            </span>
                                            {isActive && <CornerDownLeft size={16} className="hdr-search__enter" />}
                                        </div>
                                    );
                                })}
                            </div>
                        ))
                    )}
                </div>

                <div className="hdr-search__foot">
                    <span><kbd>↑↓</kbd> navigate</span>
                    <span><kbd>↵</kbd> open</span>
                    <span><kbd>esc</kbd> close</span>
                </div>
            </div>
        </div>,
        document.body,
    );
};
