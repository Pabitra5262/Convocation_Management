import React, { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown } from "lucide-react";
import { inputBase, inputNormal, inputError, inputDisabled } from "../inputStyles";
import type { Option } from "../form.types";

interface MultiSelectProps {
    label?: string;
    options: Option[];
    value: (string | number)[];
    onChange: (values: (string | number)[]) => void;
    error?: string;
    helpText?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    maxSelected?: number;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    id?: string;
    name?: string;
}

const MultiSelect: React.FC<Readonly<MultiSelectProps>> = ({
    label,
    options = [],
    value = [],
    onChange,
    error,
    helpText,
    placeholder = "Select options...",
    disabled = false,
    required = false,
    maxSelected,
    wrapperClassName = "",
    labelClassName = "",
    errorClassName = "",
    id,
    name,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [dropdownPosition, setDropdownPosition] = useState<{ top?: number; bottom?: number; left: number; width: number; maxHeight: number } | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const listboxRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const autoId = React.useId();
    const inputId = id || (name ? `multiselect-${name}` : autoId);

    const containerClasses = [
        inputBase,
        error ? inputError : inputNormal,
        disabled ? inputDisabled : "cursor-pointer hover:bg-card-bg/80",
        "flex justify-between items-center w-full text-left",
    ].join(" ");

    const filteredOptions = useMemo(
        () => options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase())),
        [options, searchTerm]
    );

    const selectedOptions = useMemo(
        () => options.filter((opt) => value.includes(opt.value)),
        [options, value]
    );

    const handleSelect = (val: string | number) => {
        if (disabled) return;
        if (value.includes(val)) {
            onChange(value.filter((v) => v !== val));
        } else {
            if (maxSelected && value.length >= maxSelected) return;
            onChange([...value, val]);
        }
    };

    const handleSelectAll = () => {
        if (disabled) return;
        const allFilteredValues = filteredOptions.map((opt) => opt.value);
        const isAllSelected = allFilteredValues.length > 0 && allFilteredValues.every((val) => value.includes(val));

        if (isAllSelected) {
            onChange(value.filter((v) => !allFilteredValues.includes(v)));
        } else {
            const newValues = [...value];
            for (const val of allFilteredValues) {
                if (!newValues.includes(val)) {
                    if (maxSelected && newValues.length >= maxSelected) break;
                    newValues.push(val);
                }
            }
            onChange(newValues);
        }
    };

    /* The listbox is portalled to <body> with viewport coordinates: a transformed ancestor (e.g. a card's
       hover / fx-rise translate) would otherwise become the containing block of a fixed element and shift it. */
    useLayoutEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            if (!triggerRef.current) return;
            const rect = triggerRef.current.getBoundingClientRect();
            const gap = 4;
            const margin = 8;
            const preferred = 288; // max-h-72
            const spaceBelow = window.innerHeight - rect.bottom - gap - margin;
            const spaceAbove = rect.top - gap - margin;
            const openUp = spaceBelow < Math.min(preferred, 200) && spaceAbove > spaceBelow;

            setDropdownPosition({
                top: openUp ? undefined : rect.bottom + gap,
                bottom: openUp ? window.innerHeight - rect.top + gap : undefined,
                left: rect.left,
                width: rect.width,
                maxHeight: Math.min(preferred, openUp ? spaceAbove : spaceBelow),
            });
        };

        updatePosition();
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);
        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;
            if (wrapperRef.current?.contains(target) || listboxRef.current?.contains(target)) return;
            setIsOpen(false);
            setSearchTerm("");
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => inputRef.current?.focus(), 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const renderSelection = () => {
        if (selectedOptions.length === 0) return <span className="text-muted-foreground truncate">{placeholder}</span>;
        if (selectedOptions.length === 1) return <span className="text-input-text font-medium truncate">{selectedOptions[0].label}</span>;
        return <span className="text-input-text font-medium">{selectedOptions.length} items selected</span>;
    };

    return (
        <div className={wrapperClassName} ref={wrapperRef}>
            {label && (
                <label htmlFor={inputId} className={`ui-label ${labelClassName}`}>
                    {label}{required && <span className="ui-required" aria-hidden>*</span>}
                    {maxSelected && <span className="ml-2 text-xs text-muted-foreground">(Max {maxSelected})</span>}
                </label>
            )}

            <div className="relative">
                <button
                    ref={triggerRef}
                    type="button"
                    id={inputId}
                    name={name}
                    className={containerClasses}
                    onClick={() => {
                        if (disabled) return;
                        setIsOpen((prev) => {
                            if (prev) setSearchTerm("");
                            return !prev;
                        });
                    }}
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <div className="flex-1 overflow-hidden min-h-[20px] flex items-center text-sm">
                        {renderSelection()}
                    </div>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>

                {isOpen && !disabled && dropdownPosition && createPortal(
                    <div
                        ref={listboxRef}
                        role="listbox"
                        aria-multiselectable
                        className="ui-listbox fixed z-[9999] overflow-hidden flex flex-col"
                        style={dropdownPosition}
                    >
                        <div className="flex items-center px-3 py-2.5 border-b border-border z-10">
                            <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                className="flex-1 bg-transparent outline-none text-sm text-input-text placeholder:text-muted-foreground"
                            />
                        </div>

                        <div className="overflow-y-auto flex-1 p-1">
                            {filteredOptions.length > 0 && (
                                <button
                                    type="button"
                                    className="ui-option font-semibold mb-1 border-b border-border"
                                    onClick={handleSelectAll}
                                >
                                    <input
                                        type="checkbox"
                                        checked={filteredOptions.every((opt) => value.includes(opt.value))}
                                        readOnly
                                        className="ui-check pointer-events-none"
                                    />
                                    <span>Select All</span>
                                </button>
                            )}

                            {filteredOptions.length ? (
                                filteredOptions.map((opt) => {
                                    const isSelected = value.includes(opt.value);
                                    return (
                                        <button
                                            type="button"
                                            key={String(opt.value)}
                                            role="option"
                                            aria-selected={isSelected}
                                            className="ui-option"
                                            onClick={() => handleSelect(opt.value)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                readOnly
                                                className="ui-check pointer-events-none shrink-0"
                                            />
                                            <span className="truncate">{opt.label}</span>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                                    No options found
                                </div>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
            </div>

            {helpText && !error && <p className="ui-help">{helpText}</p>}
            {error && <p className={`ui-error ${errorClassName}`} role="alert">{error}</p>}
        </div>
    );
};

export default MultiSelect;
