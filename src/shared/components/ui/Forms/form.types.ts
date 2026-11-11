import type { ReactNode } from "react";

export type InputType =
    | 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
    | 'date' | 'datetime-local' | 'time' | 'month' | 'week'
    | 'search' | 'color' | 'file' | 'checkbox' | 'radio';

export interface Option {
    value: string | number;
    label: string;
    disabled?: boolean;
}

export interface ValidationRule {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    email?: boolean;
    url?: boolean;
    custom?: (value: any) => boolean | string;
    message?: string;
}

export interface FormField {
    name: string;
    label?: string;
    placeholder?: string;
    type?: InputType | 'textarea' | 'select' | 'async-search' | 'multiselect' | 'radio-group' | 'checkbox-group' | 'profile-upload';
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    options?: Option[];
    multiple?: boolean;
    rows?: number;
    min?: number | string;
    max?: number | string;
    step?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    className?: string;
    wrapperClassName?: string;
    labelClassName?: string;
    errorClassName?: string;
    helpText?: string;
    validation?: ValidationRule;
    autoComplete?: string;
    onSearch?: (term: string) => Promise<Option[]>;
    dateFormat?: string;
    showTimeSelect?: boolean;
    showCount?: boolean;
    accept?: string;
    gridColumn?: number;
    render?: (value: any, onChange: (val: any) => void, error?: string) => ReactNode;
    minDate?: string | Date;
    maxDate?: string | Date;
    rowSpan?: number;
    radioSize?: 'sm' | 'md' | 'lg';
    orientation?: 'horizontal' | 'vertical';
    radioVariant?: 'default' | 'cards';
}

export interface FormProps {
    fields: FormField[];
    onSubmit: (data: Record<string, any>, methods?: any) => void;
    onValuesChange?: (values: Record<string, any>) => void;
    fieldPrefix?: string;
    /** Render only the fields (no <form> / buttons), e.g. as one step of MultiStepForm; values go to the surrounding form. */
    standalone?: boolean;
    defaultValues?: Record<string, any>;
    loading?: boolean;
    submitText?: string;
    resetText?: string;
    showReset?: boolean;
    className?: string;
    gridColumns?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    children?: ReactNode;
    validationSchema?: any;
    formId?: string;
    buttonPosition?: "bottom" | "inline";
    buttonGridColumn?: number;
    buttonClassName?: string;
}
