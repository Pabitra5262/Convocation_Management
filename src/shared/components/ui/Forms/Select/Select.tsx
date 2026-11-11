import React, { forwardRef } from "react";
import { inputBase, inputNormal, inputError, inputDisabled } from "../inputStyles";
import type { Option } from "../form.types";

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
    label?: string;
    options: Option[];
    error?: string;
    helpText?: string;
    multiple?: boolean;
    placeholder?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    selectClassName?: string;
    errorClassName?: string;
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, options, error, helpText, multiple = false, placeholder = "Select an option", className = "", wrapperClassName = "", labelClassName = "", selectClassName = "", errorClassName = "", disabled, required, id, ...props }, ref) => {
        const autoId = React.useId();
        const selectId = id || (props.name ? `select-${props.name}` : autoId);
        const selectClasses = [inputBase, error ? inputError : inputNormal, disabled ? inputDisabled : "", "", selectClassName, className].join(" ");

        return (
            <div className={wrapperClassName}>
                {label && (
                    <label htmlFor={selectId} className={`ui-label ${labelClassName}`}>
                        {label}{required && <span className="ui-required" aria-hidden>*</span>}
                    </label>
                )}
                <div className="relative">
                    <select ref={ref} id={selectId} multiple={multiple} disabled={disabled} className={`${selectClasses} pr-10`} {...props}>
                        {!multiple && placeholder && <option value="">{placeholder}</option>}
                        {options.map((option) => (
                            <option key={String(option.value)} value={option.value} disabled={option.disabled}>{option.label}</option>
                        ))}
                    </select>
                    {!multiple && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    )}
                </div>
                {helpText && !error && <p className="ui-help">{helpText}</p>}
                {error && <p className={`ui-error ${errorClassName}`} role="alert">{error}</p>}
            </div>
        );
    }
);

Select.displayName = "Select";
export default Select;
