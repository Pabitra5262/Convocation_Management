/* Horizontal progress bar with an optional label and value. Styles: src/shared/styles/display.css */

export interface ProgressBarProps {
    /** 0 to 100. */
    value: number;
    label?: string;
    /** Show "78%" after the bar. */
    showValue?: boolean;
    tone?: "primary" | "success" | "warning" | "danger";
    className?: string;
}

export const ProgressBar = ({ value, label, showValue = false, tone = "primary", className = "" }: ProgressBarProps) => {
    const pct = Math.min(100, Math.max(0, value));
    return (
        <div className={`ui-progress ${className}`}>
            {label && <span className="ui-progress__label">{label}</span>}
            <div role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label} className="ui-progress__track">
                <div className={`ui-progress__fill ui-progress__fill--${tone}`} style={{ width: `${pct}%` }} />
            </div>
            {showValue && <span className="ui-progress__value">{pct}%</span>}
        </div>
    );
};

export default ProgressBar;
