import { useState } from "react";
import { NavLink } from "react-router-dom";
import { X } from "lucide-react";
import { useT } from "@/shared/i18n/I18nProvider";
import { useNavMemory } from "./NavMemory";

/**
 * Strip of recently opened pages under the header (hims-ui-new PageTabs); each tab can be closed,
 * "Clear all" keeps only the current page. Hidden until two or more pages are open.
 * Styles: src/shared/styles/layout.css
 */
const PageTabs = () => {
    const t = useT();
    const { tabs, closeTab, clearHistory } = useNavMemory();
    const [closing, setClosing] = useState<string | null>(null);

    if (tabs.length < 2) return null;

    return (
        <nav aria-label={t("Open pages")} className="page-tabs no-print">
            <ul className="page-tabs__list">
                {tabs.map((tab) => (
                    <li key={tab.to} className={`page-tabs__item ${closing === tab.to ? "is-closing" : ""}`}>
                        <NavLink to={tab.to} end className={({ isActive }) => `page-tab ${isActive ? "is-active" : ""}`}>
                            <span className="page-tab__label">{t(tab.label)}</span>
                            <button
                                type="button"
                                aria-label={`${t("Close")} ${t(tab.label)}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setClosing(tab.to);
                                    window.setTimeout(() => {
                                        setClosing(null);
                                        closeTab(tab.to);
                                    }, 170);
                                }}
                                className="page-tab__close"
                            >
                                <X size={13} />
                            </button>
                        </NavLink>
                    </li>
                ))}
                <li className="page-tabs__clear">
                    <button type="button" onClick={clearHistory} className="page-tabs__clear-btn">
                        {t("Clear all")}
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default PageTabs;
