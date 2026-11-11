import React, { forwardRef, useMemo, useCallback } from "react";
import ReactDOM from "react-dom";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock } from "lucide-react";
import { inputBase, inputNormal, inputError, inputDisabled } from "../inputStyles";

interface DatePickerProps {
    label?: string;
    error?: string;
    helpText?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name?: string;
    id?: string;
    onBlur?: () => void;
    minDate?: string | Date;
    maxDate?: string | Date;
    type?: string;
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const pad2 = (n: number) => String(n).padStart(2, '0');

// Helper to parse dates including "today" keyword
const getParsedLimitDate = (limit: string | Date | undefined, isMin: boolean): Date | undefined => {
    if (!limit) return undefined;
    let date: Date;
    if (limit instanceof Date) {
        date = new Date(limit);
    } else if (limit === "today") {
        date = new Date();
    } else {
        date = new Date(limit);
    }
    if (Number.isNaN(date.getTime())) return undefined;

    if (isMin) {
        date.setHours(0, 0, 0, 0);
    } else {
        date.setHours(23, 59, 59, 999);
    }
    return date;
};

const parseSelectedDate = (value: string | undefined, isTimeType: boolean): Date | null => {
    if (!value) return null;
    if (isTimeType) {
        const parts = value.split(":");
        const hours = Number.parseInt(parts[0], 10);
        const minutes = Number.parseInt(parts[1], 10);
        const d = new Date();
        if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
            d.setHours(hours, minutes, 0, 0);
            return d;
        }
        return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatSelectedDate = (date: Date | null, isTimeType: boolean, isDateTimeType: boolean): string => {
    if (!date) return "";
    if (isTimeType) {
        return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
    }
    if (isDateTimeType) {
        return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
    }
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
};

const getDateFormatString = (isTime: boolean, isDateTime: boolean): string => {
    if (isTime) return "h:mm aa";
    if (isDateTime) return "dd/MM/yyyy h:mm aa";
    return "dd/MM/yyyy";
};

const getIconColorClass = (isDisabled?: boolean, hasError?: string): string => {
    if (isDisabled) return "text-muted-foreground/50 cursor-not-allowed";
    if (hasError) return "text-danger";
    return "";
};

interface DatePickerHeaderProps {
    date: Date;
    changeYear: (year: number) => void;
    changeMonth: (month: number) => void;
    decreaseMonth: () => void;
    increaseMonth: () => void;
    prevMonthButtonDisabled: boolean;
    nextMonthButtonDisabled: boolean;
    minLimit?: Date;
    maxLimit?: Date;
    yearOptions: number[];
}

const DatePickerHeader: React.FC<Readonly<DatePickerHeaderProps>> = ({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
    minLimit,
    maxLimit,
    yearOptions,
}) => {
    const year = date.getFullYear();
    const minMonth = minLimit?.getFullYear() === year ? minLimit.getMonth() : 0;
    const maxMonth = maxLimit?.getFullYear() === year ? maxLimit.getMonth() : 11;

    const handleYearSelect = (newYear: number) => {
        if (minLimit?.getFullYear() === newYear && date.getMonth() < minLimit.getMonth()) {
            changeMonth(minLimit.getMonth());
        }
        if (maxLimit?.getFullYear() === newYear && date.getMonth() > maxLimit.getMonth()) {
            changeMonth(maxLimit.getMonth());
        }
        changeYear(newYear);
    };

    return (
        <div className="flex items-center justify-between px-2 py-1 bg-transparent">
            <button
                type="button"
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="p-1 rounded hover:bg-muted/10 text-foreground disabled:opacity-40 cursor-pointer"
            >
                <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1">
                <select
                    value={date.getMonth()}
                    onChange={({ target: { value } }) => changeMonth(Number(value))}
                    className="bg-transparent border-0 outline-none text-[13px] font-semibold text-foreground cursor-pointer hover:bg-muted/10 p-1 rounded transition-colors"
                >
                    {MONTH_NAMES.map((name, index) => {
                        if (index < minMonth || index > maxMonth) return null;
                        return (
                            <option key={name} value={index} className="bg-background text-foreground">{name}</option>
                        );
                    })}
                </select>
                <select
                    value={date.getFullYear()}
                    onChange={({ target: { value } }) => handleYearSelect(Number(value))}
                    className="bg-transparent border-0 outline-none text-[13px] font-semibold text-foreground cursor-pointer hover:bg-muted/10 p-1 rounded transition-colors"
                >
                    {yearOptions.map(y => (
                        <option key={y} value={y} className="bg-background text-foreground">{y}</option>
                    ))}
                </select>
            </div>
            <button
                type="button"
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="p-1 rounded hover:bg-muted/10 text-foreground disabled:opacity-40 cursor-pointer"
            >
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

const DatePicker = forwardRef<ReactDatePicker, Readonly<DatePickerProps>>(
    ({ label, error, helpText, wrapperClassName = "", labelClassName = "", errorClassName = "", disabled, required, id, value, onChange, placeholder, name, onBlur, minDate, maxDate, type = "date" }, ref) => {
        const autoId = React.useId();
        const inputId = id || (name ? `datepicker-${name}` : autoId);

        const isTimeType = type === "time";
        const isDateTimeType = type === "datetime-local";
        const showTime = isTimeType || isDateTimeType;

        const selectedDate = useMemo(() => parseSelectedDate(value, isTimeType), [value, isTimeType]);

        const minLimit = useMemo(() => getParsedLimitDate(minDate, true), [minDate]);
        const maxLimit = useMemo(() => getParsedLimitDate(maxDate, false), [maxDate]);

        const handleDateChange = useCallback((date: Date | null) => {
            const formatted = formatSelectedDate(date, isTimeType, isDateTimeType);
            onChange?.({
                target: { value: formatted, name }
            } as React.ChangeEvent<HTMLInputElement>);
        }, [isTimeType, isDateTimeType, name, onChange]);

        const yearOptions = useMemo(() => {
            const currentYear = new Date().getFullYear();
            const startYear = maxLimit ? maxLimit.getFullYear() : currentYear + 10;
            const endYear = minLimit ? minLimit.getFullYear() : currentYear - 110;
            const length = Math.max(1, startYear - endYear + 1);
            return Array.from({ length }, (_, i) => startYear - i);
        }, [minLimit, maxLimit]);

        const dateFormatStr = getDateFormatString(isTimeType, isDateTimeType);
        const iconColor = getIconColorClass(disabled, error);

        const renderHeader = useCallback((headerProps: Parameters<NonNullable<React.ComponentProps<typeof ReactDatePicker>["renderCustomHeader"]>>[0]) => (
            <DatePickerHeader
                {...headerProps}
                minLimit={minLimit}
                maxLimit={maxLimit}
                yearOptions={yearOptions}
            />
        ), [minLimit, maxLimit, yearOptions]);

        return (
            <div className={wrapperClassName}>
                {label && (
                    <label htmlFor={inputId} className={`ui-label ${labelClassName}`}>
                        {label}{required && <span className="ui-required" aria-hidden>*</span>}
                    </label>
                )}
                <div className="relative">
                    <ReactDatePicker
                        ref={ref}
                        selected={selectedDate}
                        onChange={handleDateChange}
                        disabled={disabled}
                        onBlur={onBlur}
                        placeholderText={placeholder || (isTimeType ? "hh:mm aa" : "dd/mm/yyyy")}
                        dateFormat={dateFormatStr}
                        showTimeSelect={showTime}
                        showTimeSelectOnly={isTimeType}
                        timeIntervals={15}
                        timeCaption="Time"
                        minDate={minLimit}
                        maxDate={maxLimit}
                        className={[
                            inputBase,
                            "pr-12 cursor-pointer",
                            error ? inputError : inputNormal,
                            disabled ? inputDisabled : "",
                        ].join(" ")}
                        wrapperClassName="w-full"
                        id={inputId}
                        popperContainer={({ children }) => ReactDOM.createPortal(children, document.body)}
                        popperClassName="!z-[9999]"
                        renderCustomHeader={isTimeType ? undefined : renderHeader}
                    />

                    {/* Control overlay */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10 pointer-events-none">
                        {value && !disabled && (
                            <X
                                size={14}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDateChange(null);
                                }}
                                className="text-muted-foreground hover:text-danger cursor-pointer pointer-events-auto transition-colors"
                            />
                        )}
                        {isTimeType ? (
                            <Clock
                                size={16}
                                className={`text-muted-foreground ${iconColor}`}
                            />
                        ) : (
                            <CalendarIcon
                                size={16}
                                className={`text-muted-foreground ${iconColor}`}
                            />
                        )}
                    </div>
                </div>
                {helpText && !error && <p className="ui-help">{helpText}</p>}
                {error && <p className={`ui-error ${errorClassName}`} role="alert">{error}</p>}
            </div>
        );
    }
);

DatePicker.displayName = "DatePicker";
export default DatePicker;
