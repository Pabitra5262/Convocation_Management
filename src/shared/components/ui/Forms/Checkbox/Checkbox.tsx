import { forwardRef } from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    helpText?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, error, wrapperClassName = "", labelClassName = "", errorClassName = "", helpText, className = "", required, ...props }, ref) => {
        return (
            <div className={wrapperClassName}>
                <div className={`${label ? 'min-h-[75px]' : 'py-1'} flex items-center`}>
                    <label htmlFor={props.id} className={`flex items-center gap-2 text-sm font-medium text-foreground ${labelClassName}`}>
                        <input
                            ref={ref}
                            type="checkbox"
                            className={`ui-check ${className}`}
                            {...props}
                        />
                        {label}{required && <span className="ui-required" aria-hidden>*</span>}
                    </label>
                </div>
                {helpText && !error && <p className="ui-help ml-6">{helpText}</p>}
                {error && <p className={`ui-error ml-6 ${errorClassName}`}>{error}</p>}
            </div>
        );
    }
);

Checkbox.displayName = "Checkbox";
export default Checkbox;
