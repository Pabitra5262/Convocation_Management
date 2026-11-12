import { useId, type CSSProperties } from 'react';

interface RegistrationToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  gridColumn?: number;
}

export const RegistrationToggle = ({ checked, onChange, disabled, error, gridColumn = 1 }: RegistrationToggleProps) => {
  const id = useId();
  return <div className="col-span-full sm:col-span-1 md:col-span-2 lg:col-span-(--field-columns)"
    style={{ '--field-columns': gridColumn } as CSSProperties}>
    <label htmlFor={id} className="ui-label">Is Registration Open</label>
    <label className={`app-switch mt-2 w-fit ${disabled ? 'cursor-not-allowed! opacity-60' : ''}`}>
      <input id={id} type="checkbox" role="switch" aria-label="Is Registration Open" checked={checked} disabled={disabled}
        aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} onChange={e => onChange(e.target.checked)} />
      <span aria-hidden className="app-switch__track" />
    </label>
    {error && <p id={`${id}-error`} className="ui-error" role="alert">{error}</p>}
  </div>;
};
