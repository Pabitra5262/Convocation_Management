import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import type { TabsProps, TabItem } from "./tab.types";

/**
 * Tabs (hims-ui-new Navigation/Tabs). Styles: src/shared/styles/components.css
 * ← → / Home / End move between tabs; the line variant's underline slides to the selected tab.
 */
export default function Tabs({
    tabs,
    activeTab,
    onChange,
    variant = "pills",
    size = "md",
    label,
    idPrefix = "tabs",
    className = "",
}: Readonly<TabsProps>) {
    const listRef = useRef<HTMLDivElement>(null);
    const enabled = tabs.filter((t) => !t.disabled);
    const active = tabs.find((t) => t.key === activeTab);

    const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
        const i = enabled.findIndex((t) => t.key === activeTab);
        let next = -1;
        if (e.key === "ArrowRight") next = (i + 1) % enabled.length;
        else if (e.key === "ArrowLeft") next = (i - 1 + enabled.length) % enabled.length;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = enabled.length - 1;
        if (next < 0) return;
        e.preventDefault();
        onChange(enabled[next].key);
        requestAnimationFrame(() => listRef.current?.querySelector<HTMLElement>(`#${idPrefix}-tab-${enabled[next].key}`)?.focus());
    };

    const [bar, setBar] = useState<{ x: number; w: number } | null>(null);
    useLayoutEffect(() => {
        if (variant !== "line") return;
        const el = listRef.current?.querySelector<HTMLElement>(`#${idPrefix}-tab-${activeTab}`);
        if (!el) return;
        const next = { x: el.offsetLeft, w: el.offsetWidth };
        const raf = requestAnimationFrame(() => setBar(next));
        return () => cancelAnimationFrame(raf);
    }, [activeTab, idPrefix, tabs.length, size, variant]);

    return (
        <div className={className}>
            <div
                ref={listRef}
                role="tablist"
                aria-label={label}
                onKeyDown={onKey}
                className={`ui-tabs ui-tabs--${variant} ui-tabs--${size}`}
            >
                {tabs.map((tab: TabItem) => {
                    const Icon = tab.icon;
                    const selected = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            id={`${idPrefix}-tab-${tab.key}`}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            aria-controls={tab.content === undefined ? undefined : `${idPrefix}-panel-${tab.key}`}
                            tabIndex={selected ? 0 : -1}
                            disabled={tab.disabled}
                            onClick={() => onChange(tab.key)}
                            className="ui-tab"
                        >
                            {Icon && <Icon size={size === "sm" ? 14 : 16} />}
                            <span>{tab.label}</span>
                            {tab.count !== undefined && <span className="ui-tab__count">{tab.count}</span>}
                        </button>
                    );
                })}
                {variant === "line" && bar && <span aria-hidden className="ui-tabs__indicator" style={{ translate: `${bar.x}px 0`, width: bar.w }} />}
            </div>
            {active?.content !== undefined && (
                <div role="tabpanel" id={`${idPrefix}-panel-${active.key}`} aria-labelledby={`${idPrefix}-tab-${active.key}`} tabIndex={0} className="ui-tabpanel">
                    {active.content}
                </div>
            )}
        </div>
    );
}
