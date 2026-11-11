import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ReactDOM from "react-dom";
import { ChevronDown, Search, X, Loader2 } from "lucide-react";
import { inputBase, inputNormal, inputError, inputDisabled } from "../inputStyles";

export interface Option {
    label: string;
    value: string | number;
}

export interface SearchableSelectProps {
    options?: Option[];
    value?: string | number;
    onChange: (value: string | number) => void;
    onSearch?: (term: string) => Promise<Option[]>;
    label?: string;
    error?: string;
    helpText?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    id?: string;
    debounceMs?: number;
    /** Accessible name when there is no visible label (e.g. a table filter). */
    "aria-label"?: string;
}

export const SearchableSelect: React.FC<Readonly<SearchableSelectProps>> = ({
    options: staticOptions = [],
    value = "",
    onChange,
    onSearch,
    label,
    error,
    helpText,
    placeholder = "Search and select...",
    disabled = false,
    required = false,
    wrapperClassName = "",
    labelClassName = "",
    errorClassName = "",
    id,
    debounceMs = 500,
    "aria-label": ariaLabel,
}) => {
    const labelId = React.useId();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Option[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const containerClasses = [
        inputBase,
        error ? inputError : inputNormal,
        disabled ? inputDisabled : "cursor-pointer",
        "flex items-center justify-between gap-2 text-left w-full pr-12",
    ].join(" ");

    const displayOptions = useMemo(() => {
        if (onSearch) {
            return searchTerm ? searchResults : staticOptions;
        }
        if (!searchTerm) return staticOptions;
        return staticOptions.filter((opt) =>
            opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [onSearch, searchTerm, searchResults, staticOptions]);

    const selectedOption = useMemo(() => {
        const all = onSearch ? [...searchResults, ...staticOptions] : staticOptions;
        return all.find((opt) => String(opt.value) === String(value));
    }, [onSearch, searchResults, staticOptions, value]);

    const updateCoords = useCallback(() => {
        if (wrapperRef.current) {
            const rect = wrapperRef.current.getBoundingClientRect();
            setCoords((prev) => {
                const newTop = rect.bottom + window.scrollY;
                const newLeft = rect.left + window.scrollX;
                const newWidth = rect.width;
                if (prev.top === newTop && prev.left === newLeft && prev.width === newWidth) {
                    return prev;
                }
                return { top: newTop, left: newLeft, width: newWidth };
            });
        }
    }, []);

    const performSearch = useCallback(async (term: string) => {
        if (!onSearch) return;

        setIsLoading(true);
        try {
            const results = await onSearch(term);
            const filtered = results.filter((opt) =>
                opt.label.toLowerCase().includes(term.toLowerCase())
            );
            setSearchResults(filtered);
        } catch (err) {
            console.error("Search error:", err);
            setSearchResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [onSearch]);

    useEffect(() => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

        if (isOpen && searchTerm && onSearch) {
            debounceTimerRef.current = setTimeout(() => {
                performSearch(searchTerm);
            }, debounceMs);
        }

        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [searchTerm, performSearch, debounceMs, isOpen, onSearch]);

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener("scroll", updateCoords, true);
            window.addEventListener("resize", updateCoords);
        }
        return () => {
            window.removeEventListener("scroll", updateCoords, true);
            window.removeEventListener("resize", updateCoords);
        };
    }, [isOpen, updateCoords]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isInsidePortal = target.closest("[data-dropdown-portal]");
            if (wrapperRef.current && !wrapperRef.current.contains(target) && !isInsidePortal) {
                setIsOpen(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (option: Option) => {
        if (disabled) return;
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm("");
    };

    const clearSelection = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        setSearchTerm("");
    };

    const dropdownPortal = isOpen && !disabled ? ReactDOM.createPortal(
        <div
            data-dropdown-portal
            role="listbox"
            className="ui-listbox fixed z-[9999] mt-1 overflow-hidden flex flex-col"
            style={{
                top: coords.top - window.scrollY,
                left: coords.left,
                width: coords.width,
                maxHeight: `calc(100vh - ${coords.top - window.scrollY + 16}px)`
            }}
        >
            <div className="p-2 border-b border-border bg-surface-hover flex-shrink-0">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        type="text"
                        autoFocus
                        className="w-full pl-9 pr-4 py-1.5 text-[13px] bg-transparent border-none outline-none focus:ring-0 text-input-text placeholder:text-muted/60"
                        placeholder="Type to search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {isLoading && (
                        <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
                    )}
                </div>
            </div>
            <div className="max-h-60 overflow-auto p-1 flex-1">
                {displayOptions.length > 0 ? (
                    displayOptions.map((opt) => {
                        const isSelected = String(opt.value) === String(value);
                        return (
                            <button
                                key={String(opt.value)}
                                type="button"
                                role="option"
                                aria-selected={isSelected}
                                className="ui-option"
                                onClick={() => handleSelect(opt)}
                            >
                                {opt.label}
                            </button>
                        );
                    })
                ) : (
                    <div className="px-3 py-4 text-center text-[13px] text-muted-foreground italic">
                        {isLoading ? "Searching..." : "No results found"}
                    </div>
                )}
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className={wrapperClassName} id={id}>
            {label && (
                <label id={labelId} className={`ui-label ${labelClassName}`}>
                    {label}{required && <span className="ui-required" aria-hidden>*</span>}
                </label>
            )}
            <div ref={wrapperRef} className="relative">
                <button
                    type="button"
                    className={containerClasses}
                    onClick={() => !disabled && setIsOpen((prev) => !prev)}
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-label={ariaLabel}
                    aria-labelledby={label && !ariaLabel ? labelId : undefined}
                >
                    <div className="flex-1 truncate text-[14px]">
                        {selectedOption ? (
                            <span className="text-input-text">{selectedOption.label}</span>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </div>
                </button>

                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                    {value && !disabled && (
                        <button
                            type="button"
                            aria-label="Clear selection"
                            onClick={clearSelection}
                            className="pointer-events-auto p-0.5 rounded text-muted-foreground hover:text-danger transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </div>

                {dropdownPortal}
            </div>
            {helpText && !error && <p className="ui-help">{helpText}</p>}
            {error && <p className={`ui-error ${errorClassName}`}>{error}</p>}
        </div>
    );
};

export default SearchableSelect;
