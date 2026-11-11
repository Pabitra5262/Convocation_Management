import React, { forwardRef } from "react";
import { Radio, type RadioSize, type RadioVariant } from "../Radio";

export interface RadioOption {
    label: React.ReactNode;
    value: string | number;
    disabled?: boolean;
    description?: React.ReactNode;
    badge?: string;
    icon?: React.ReactNode;
}

export type RadioGroupOrientation = 'horizontal' | 'vertical';
export type RadioGroupVariant = 'default' | 'cards';

export interface RadioGroupProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'value' | 'defaultValue'> {
    label?: string;
    name?: string;
    options: RadioOption[];
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onValueChange?: (val: string | number) => void;
    size?: RadioSize;
    variant?: RadioGroupVariant;
    colorVariant?: RadioVariant;
    orientation?: RadioGroupOrientation;
    direction?: 'row' | 'column'; // alias for orientation
    error?: string;
    helpText?: string;
    required?: boolean;
    disabled?: boolean;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    optionsClassName?: string;
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
    (
        {
            label,
            name,
            options = [],
            value,
            defaultValue,
            onChange,
            onValueChange,
            size = "md",
            variant = "default",
            colorVariant = "primary",
            orientation = "vertical",
            direction,
            error,
            helpText,
            required,
            disabled = false,
            wrapperClassName = "",
            labelClassName = "",
            errorClassName = "",
            optionsClassName = "",
            ...props
        },
        ref
    ) => {
        const generatedName = React.useId();
        const groupName = name || generatedName;

        const isHorizontal = direction === 'row' || orientation === 'horizontal';

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>, optVal: string | number) => {
            onChange?.(e);
            onValueChange?.(optVal);
        };

        return (
            <div className={`w-full ${wrapperClassName}`} ref={ref}>
                {label && (
                    <label className={`ui-label ${labelClassName}`}>
                        {label}
                        {required && <span className="ui-required" aria-hidden>*</span>}
                    </label>
                )}

                {variant === "cards" ? (
                    <div
                        className={`grid gap-3 ${
                            isHorizontal ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' : 'grid-cols-1'
                        } ${optionsClassName}`}
                    >
                        {options.map((option) => {
                            const isChecked = value !== undefined ? value === option.value : undefined;
                            const isDefaultChecked = defaultValue !== undefined ? defaultValue === option.value : undefined;
                            const isOptDisabled = disabled || option.disabled;

                            return (
                                <label
                                    key={String(option.value)}
                                    className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                                        isChecked
                                            ? 'border-primary bg-primary/5 dark:bg-primary/10 shadow-xs'
                                            : 'border-input-border bg-input-bg hover:border-muted dark:border-slate-700'
                                    } ${isOptDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Radio
                                        name={groupName}
                                        value={option.value}
                                        checked={isChecked}
                                        defaultChecked={isDefaultChecked}
                                        disabled={isOptDisabled}
                                        size={size}
                                        variant={colorVariant}
                                        onChange={(e) => handleChange(e, option.value)}
                                        {...props}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                                                {option.icon}
                                                {option.label}
                                            </span>
                                            {option.badge && (
                                                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                                    {option.badge}
                                                </span>
                                            )}
                                        </div>
                                        {option.description && (
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {option.description}
                                            </p>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                    </div>
                ) : (
                    <div
                        className={`flex ${
                            isHorizontal ? 'flex-row flex-wrap items-center gap-x-6 gap-y-2' : 'flex-col space-y-2.5'
                        } ${optionsClassName}`}
                    >
                        {options.map((option) => {
                            const isChecked = value !== undefined ? value === option.value : undefined;
                            const isDefaultChecked = defaultValue !== undefined ? defaultValue === option.value : undefined;
                            const isOptDisabled = disabled || option.disabled;

                            return (
                                <Radio
                                    key={String(option.value)}
                                    name={groupName}
                                    value={option.value}
                                    label={option.label}
                                    description={option.description}
                                    checked={isChecked}
                                    defaultChecked={isDefaultChecked}
                                    disabled={isOptDisabled}
                                    size={size}
                                    variant={colorVariant}
                                    onChange={(e) => handleChange(e, option.value)}
                                    {...props}
                                />
                            );
                        })}
                    </div>
                )}

                {helpText && !error && (
                    <p className="mt-1.5 text-xs text-muted-foreground">{helpText}</p>
                )}
                {error && (
                    <p className={`ui-error ${errorClassName}`}>{error}</p>
                )}
            </div>
        );
    }
);

RadioGroup.displayName = "RadioGroup";
export default RadioGroup;
