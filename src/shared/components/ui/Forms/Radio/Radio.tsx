import React, { forwardRef } from 'react';

export type RadioSize = 'sm' | 'md' | 'lg';
export type RadioVariant = 'primary' | 'success' | 'danger' | 'warning' | 'secondary';

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: React.ReactNode;
    description?: React.ReactNode;
    size?: RadioSize;
    variant?: RadioVariant;
    error?: string;
    helpText?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    descriptionClassName?: string;
    errorClassName?: string;
}

const sizeConfig: Record<RadioSize, { radio: string; label: string; desc: string; gap: string; textMargin: string }> = {
    sm: {
        radio: 'w-3.5 h-3.5 mt-0.5',
        label: 'text-xs',
        desc: 'text-[11px]',
        gap: 'gap-1.5',
        textMargin: 'ml-5',
    },
    md: {
        radio: 'w-4 h-4 mt-0.5',
        label: 'text-sm',
        desc: 'text-xs',
        gap: 'gap-2',
        textMargin: 'ml-6',
    },
    lg: {
        radio: 'w-5 h-5 mt-0.5',
        label: 'text-base',
        desc: 'text-sm',
        gap: 'gap-2.5',
        textMargin: 'ml-7',
    },
};

const variantConfig: Record<RadioVariant, string> = {
    primary: '',
    success: 'ui-radio--success',
    danger: 'ui-radio--danger',
    warning: 'ui-radio--warning',
    secondary: 'ui-radio--secondary',
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
    (
        {
            label,
            description,
            size = 'md',
            variant = 'primary',
            error,
            helpText,
            wrapperClassName = '',
            labelClassName = '',
            descriptionClassName = '',
            errorClassName = '',
            className = '',
            disabled,
            required,
            id,
            ...props
        },
        ref
    ) => {
        const generatedId = React.useId();
        const inputId = id || generatedId;
        const currentSize = sizeConfig[size] || sizeConfig.md;
        const currentVariant = variantConfig[variant] || variantConfig.primary;

        return (
            <div className={`flex flex-col ${wrapperClassName}`}>
                <label
                    htmlFor={inputId}
                    className={`inline-flex items-start ${currentSize.gap} cursor-pointer select-none ${
                        disabled ? 'opacity-50 cursor-not-allowed' : ''
                    } ${labelClassName}`}
                >
                    <input
                        ref={ref}
                        type="radio"
                        id={inputId}
                        disabled={disabled}
                        required={required}
                        className={`ui-radio ${currentSize.radio} ${currentVariant} ${
                            disabled ? 'cursor-not-allowed' : ''
                        } ${className}`}
                        {...props}
                    />
                    {(label || description) && (
                        <div className="flex flex-col">
                            {label && (
                                <span className={`font-medium text-foreground ${currentSize.label}`}>
                                    {label}
                                    {required && <span className="ui-required" aria-hidden>*</span>}
                                </span>
                            )}
                            {description && (
                                <span className={`text-muted-foreground mt-0.5 ${currentSize.desc} ${descriptionClassName}`}>
                                    {description}
                                </span>
                            )}
                        </div>
                    )}
                </label>
                {helpText && !error && (
                    <p className={`mt-1 text-xs text-muted-foreground ${currentSize.textMargin}`}>
                        {helpText}
                    </p>
                )}
                {error && (
                    <p className={`ui-error ${currentSize.textMargin} ${errorClassName}`}>
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Radio.displayName = 'Radio';

export const RadioButton = Radio;
export default Radio;
