import { Check } from "lucide-react";

/* Ported from hims-ui-new components/ui/Navigation/Navigation.tsx (Stepper). Styles: src/shared/styles/forms.css (.ui-stepper) */

export interface StepperStep {
    id: string;
    label: string;
    /** Small line under the label, e.g. "Name, contact and address". */
    description?: string;
}

export interface StepperProps {
    steps: StepperStep[];
    /** Index of the current step; every step before it is shown as done. */
    current: number;
    /** Lets the user go back to a done step (or re-open the current one). Later steps open only through Next. */
    onStepClick?: (index: number) => void;
    className?: string;
}

/** Numbered progress: done steps get a check and a filled line, the current one a tinted ring. Vertical on phones. */
export const Stepper = ({ steps, current, onStepClick, className = "" }: StepperProps) => (
    <ol className={`ui-stepper ${className}`} aria-label="Progress">
        {steps.map((s, i) => {
            const done = i < current;
            const active = i === current;
            const clickable = !!onStepClick && (done || active);
            let state = "";
            if (done) state = " (completed)";
            else if (active) state = " (current)";
            return (
                <li key={s.id} className="ui-stepper__step" aria-current={active ? "step" : undefined}>
                    <div className="ui-stepper__head">
                        <button
                            type="button"
                            disabled={!clickable}
                            onClick={() => onStepClick?.(i)}
                            aria-label={`Step ${i + 1}: ${s.label}${state}`}
                            className={`ui-stepper__dot ${done ? "is-done" : ""} ${active ? "is-active" : ""}`}
                        >
                            {done ? <Check size={16} strokeWidth={3} /> : i + 1}
                        </button>
                        {i < steps.length - 1 && <span aria-hidden className={`ui-stepper__line ${done ? "is-done" : ""}`} />}
                    </div>
                    <div className="ui-stepper__text">
                        <p className={`ui-stepper__label ${active ? "is-active" : ""}`}>{s.label}</p>
                        {s.description && <p className="ui-stepper__desc">{s.description}</p>}
                    </div>
                </li>
            );
        })}
    </ol>
);

export default Stepper;
