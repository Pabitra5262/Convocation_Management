import React, { useEffect, useMemo } from 'react';
import { useForm, useWatch, useFormContext, Controller, FormProvider } from 'react-hook-form';
import type { Control, UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { FormField, FormProps } from '../form.types';
import { generateZodSchema } from '../schemaUtils';
import Input from '../Input';
import TextArea from '../TextArea';
import DatePicker from '../DatePicker';
import TimePicker from '../TimePicker';
import ProfileUpload from '../ProfileUpload';
import MultiSelect from '../MultiSelect';
import Checkbox from '../Checkbox';
import RadioGroup from '../RadioGroup';
import UploadFile from '../UploadFile';
import SearchableSelect from '../SearchableSelect';

const GRID_COLUMNS_MAP: Record<number, string> = {
    12: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12',
    6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
    4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    2: 'grid-cols-1 sm:grid-cols-2',
    1: 'grid-cols-1',
};

const getGridClass = (columns: number = 1): string => GRID_COLUMNS_MAP[columns] || 'grid-cols-1';

const COL_SPAN_12_MAP: Record<number, string> = {
    1: "col-span-12 md:col-span-1",
    2: "col-span-12 sm:col-span-4 md:col-span-2",
    3: "col-span-12 sm:col-span-6 md:col-span-3",
    4: "col-span-12 sm:col-span-6 md:col-span-4",
    5: "col-span-12 sm:col-span-8 md:col-span-5",
    6: "col-span-12 sm:col-span-6",
    12: "col-span-12",
};

const COL_SPAN_DEFAULT_MAP: Record<number, string> = {
    1: "col-span-1",
    2: "col-span-2 sm:col-span-1 lg:col-span-2",
    3: "col-span-3 sm:col-span-2 lg:col-span-3",
    4: "col-span-4 sm:col-span-2 lg:col-span-4",
    5: "col-span-5 sm:col-span-3 lg:col-span-5",
    6: "col-span-6 sm:col-span-3 lg:col-span-6",
    12: "col-span-12",
};

const ROW_SPAN_MAP: Record<number, string> = {
    1: "row-span-1",
    2: "row-span-2",
    3: "row-span-3",
    4: "row-span-4",
    5: "row-span-5",
    6: "row-span-6",
};

const getColSpanClass = (gridColumns: number, fieldColumn?: number): string => {
    if (!fieldColumn) return "";
    return gridColumns === 12
        ? COL_SPAN_12_MAP[fieldColumn] || ""
        : COL_SPAN_DEFAULT_MAP[fieldColumn] || "";
};

const getRowSpanClass = (rowSpan?: number): string => {
    if (!rowSpan) return "";
    return ROW_SPAN_MAP[rowSpan] || "";
};

const isShallowEqual = (objA: Record<string, unknown> | null | undefined, objB: Record<string, unknown> | null | undefined): boolean => {
    if (Object.is(objA, objB)) return true;
    if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) return false;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
        if (!Object.hasOwn(objB, key) || !Object.is(objA[key], objB[key])) {
            return false;
        }
    }
    return true;
};

interface CommonFieldProps {
    label?: string;
    error?: string;
    helpText?: string;
    disabled?: boolean;
    required?: boolean;
    wrapperClassName: string;
    labelClassName?: string;
    errorClassName?: string;
    id: string;
    name: string;
    placeholder?: string;
    className?: string;
    readOnly?: boolean;
}

const renderControlledField = (
    field: FormField,
    fieldName: string,
    commonProps: CommonFieldProps,
    control?: Control<Record<string, unknown>>
) => {
    switch (field.type) {
        case 'select':
        case 'async-search':
            return (
                <Controller
                    key={field.name}
                    name={fieldName}
                    control={control}
                    render={({ field: ctrl, fieldState }) => (
                        <SearchableSelect
                            {...commonProps}
                            value={ctrl.value as string | number | undefined}
                            onChange={ctrl.onChange}
                            onSearch={field.onSearch}
                            options={field.options}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            );
        case 'date':
        case 'datetime-local':
        case 'month':
        case 'week':
            return (
                <Controller
                    key={field.name}
                    name={fieldName}
                    control={control}
                    render={({ field: ctrl, fieldState }) => (
                        <DatePicker
                            {...commonProps}
                            type={field.type}
                            value={(ctrl.value as string) ?? ''}
                            onChange={(e) => ctrl.onChange(e.target.value)}
                            onBlur={ctrl.onBlur}
                            error={fieldState.error?.message}
                            minDate={field.minDate}
                            maxDate={field.maxDate}
                        />
                    )}
                />
            );
        case 'time':
            return (
                <Controller
                    key={field.name}
                    name={fieldName}
                    control={control}
                    render={({ field: ctrl, fieldState }) => (
                        <TimePicker
                            {...commonProps}
                            value={(ctrl.value as string) ?? ''}
                            onChange={ctrl.onChange}
                            onBlur={ctrl.onBlur}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            );
        case 'profile-upload':
            return (
                <Controller
                    key={field.name}
                    name={fieldName}
                    control={control}
                    render={({ field: ctrl, fieldState }) => (
                        <ProfileUpload
                            {...commonProps}
                            value={ctrl.value as File | string | null}
                            onChange={ctrl.onChange}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            );
        case 'tel':
            return (
                <Controller
                    key={field.name}
                    name={fieldName}
                    control={control}
                    render={({ field: ctrl }) => (
                        <Input
                            {...commonProps}
                            type="tel"
                            maxLength={field.maxLength || 10}
                            value={(ctrl.value as string) ?? ''}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const cleaned = e.target.value.replace(/\D/g, '').slice(0, field.maxLength || 10);
                                ctrl.onChange(cleaned);
                            }}
                            onBlur={ctrl.onBlur}
                        />
                    )}
                />
            );
        case 'radio-group':
            return (
                <Controller
                    key={field.name}
                    name={fieldName}
                    control={control}
                    render={({ field: ctrl, fieldState }) => (
                        <RadioGroup
                            {...commonProps}
                            name={fieldName}
                            options={field.options || []}
                            value={ctrl.value as string | number | undefined}
                            onChange={(e) => ctrl.onChange(e.target.value)}
                            onBlur={ctrl.onBlur}
                            size={field.radioSize}
                            orientation={field.orientation}
                            variant={field.radioVariant}
                            error={fieldState.error?.message}
                        />
                    )}
                />
            );
        default:
            return null;
    }
};

const renderStaticField = (
    field: FormField,
    fieldName: string,
    commonProps: CommonFieldProps,
    register: UseFormRegister<Record<string, unknown>>,
    setValue: UseFormSetValue<Record<string, unknown>>,
    fieldValue?: unknown
) => {
    switch (field.type) {
        case 'textarea':
            return <TextArea key={field.name} {...commonProps} rows={field.rows} maxLength={field.maxLength} {...register(fieldName)} />;
        case 'multiselect':
            return (
                <MultiSelect
                    key={field.name}
                    {...commonProps}
                    options={field.options || []}
                    value={(fieldValue as (string | number)[]) || []}
                    onChange={(values) => setValue(fieldName, values, { shouldValidate: true })}
                    maxSelected={field.maxLength}
                />
            );
        case 'radio-group':
            return (
                <RadioGroup
                    key={field.name}
                    {...commonProps}
                    options={field.options || []}
                    size={field.radioSize}
                    orientation={field.orientation}
                    variant={field.radioVariant}
                    {...register(fieldName)}
                />
            );
        case 'checkbox':
            return <Checkbox key={field.name} {...commonProps} label={field.label || ''} {...register(fieldName)} />;
        case 'file':
            return (
                <UploadFile
                    key={field.name}
                    {...commonProps}
                    value={fieldValue as File | null | undefined}
                    onChange={(file) => setValue(fieldName, file, { shouldValidate: true })}
                    accept={field.accept || ".pdf"}
                />
            );
        default:
            return (
                <Input
                    key={field.name}
                    {...commonProps}
                    type={field.type || 'text'}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    pattern={field.pattern}
                    autoComplete={field.autoComplete}
                    {...register(fieldName)}
                />
            );
    }
};

interface FieldRendererProps {
    field: FormField;
    fieldPrefix?: string;
    gridColumns: number;
    control?: Control<Record<string, unknown>>;
    register: UseFormRegister<Record<string, unknown>>;
    setValue: UseFormSetValue<Record<string, unknown>>;
    watch?: UseFormWatch<Record<string, unknown>>;
    errors: FieldErrors<Record<string, unknown>>;
}

const renderFieldElement = ({
    field,
    fieldPrefix,
    gridColumns,
    control,
    register,
    setValue,
    watch,
    errors,
}: FieldRendererProps) => {
    if (!field) return null;
    const fieldName = fieldPrefix ? `${fieldPrefix}.${field.name}` : field.name;
    const colSpanClass = getColSpanClass(gridColumns, field.gridColumn);
    const rowSpanClass = getRowSpanClass(field.rowSpan);

    const errorMessage = (errors[fieldName]?.message as string | undefined) || (errors[field.name]?.message as string | undefined);

    const commonProps: CommonFieldProps = {
        label: field.label,
        error: errorMessage,
        helpText: field.helpText,
        disabled: field.disabled,
        required: field.required || field.validation?.required,
        wrapperClassName: `${colSpanClass} ${rowSpanClass} ${field.wrapperClassName || ""}`,
        labelClassName: field.labelClassName,
        errorClassName: field.errorClassName,
        id: fieldName,
        name: fieldName,
        placeholder: field.placeholder,
        className: field.className,
        readOnly: field.readOnly,
    };

    if (field.render) {
        return (
            <Controller
                key={field.name}
                name={fieldName}
                control={control}
                render={({ field: ctrl, fieldState }) => (
                    <>{field.render!(ctrl.value, ctrl.onChange, fieldState.error?.message)}</>
                )}
            />
        );
    }

    const controlled = renderControlledField(field, fieldName, commonProps, control);
    if (controlled) {
        return controlled;
    }

    const fieldValue = watch ? watch(fieldName) : undefined;
    return renderStaticField(field, fieldName, commonProps, register, setValue, fieldValue);
};

const FormGenerator: React.FC<Readonly<FormProps>> = ({
    fields,
    onSubmit,
    defaultValues,
    className = '',
    gridColumns = 1,
    children,
    validationSchema,
    onValuesChange,
    standalone = false,
    fieldPrefix,
    formId,
    buttonPosition = "bottom",
    buttonGridColumn,
    buttonClassName = "",
}) => {
    const parentContext = useFormContext();
    const schema = useMemo(() => {
        try {
            return validationSchema || generateZodSchema(fields || []);
        } catch (e) {
            console.error("Schema generation failed:", e);
            return z.object({});
        }
    }, [fields, validationSchema]);

    const computedDefaultValues = useMemo(() => {
        const defaults: Record<string, unknown> = { ...defaultValues };
        for (const field of fields || []) {
            if (defaults[field.name] === undefined) {
                if (field.type === 'multiselect') {
                    defaults[field.name] = [];
                } else if (field.type === 'checkbox') {
                    defaults[field.name] = false;
                } else if (field.type === 'number') {
                    defaults[field.name] = undefined;
                } else {
                    defaults[field.name] = '';
                }
            }
        }
        return defaults;
    }, [fields, defaultValues]);

    const internalForm = useForm<Record<string, unknown>>({
        defaultValues: computedDefaultValues,
        resolver: zodResolver(schema),
        mode: 'onChange',
    });

    // Inside a FormProvider (e.g. MultiStepForm, or with `standalone` as part of a bigger form) the fields join that form;
    // on its own the generator keeps its own form state.
    const activeContext = parentContext ?? internalForm;
    const { register, handleSubmit, formState, reset, watch, setValue, control } = activeContext;
    const errors = formState?.errors || {};

    const allValues = useWatch({ control });
    const prevValuesRef = React.useRef<Record<string, unknown>>(defaultValues || {});
    const isInternalChangeRef = React.useRef(false);

    useEffect(() => {
        if (onValuesChange && allValues) {
            if (!isShallowEqual(allValues as Record<string, unknown>, prevValuesRef.current)) {
                isInternalChangeRef.current = true;
                onValuesChange(allValues as Record<string, unknown>);
                prevValuesRef.current = { ...(allValues as Record<string, unknown>) };
            }
        }
    }, [allValues, onValuesChange]);

    const prevDefaultValuesRef = React.useRef<Record<string, unknown> | undefined>(defaultValues);
    useEffect(() => {
        if (defaultValues && reset) {
            const nextDefaultValuesStr = JSON.stringify(defaultValues);
            const prevDefaultValuesStr = JSON.stringify(prevDefaultValuesRef.current);

            if (isInternalChangeRef.current) {
                isInternalChangeRef.current = false;
                prevDefaultValuesRef.current = defaultValues;
                return;
            }

            const hasParentChanged = nextDefaultValuesStr !== prevDefaultValuesStr;

            if (hasParentChanged) {
                reset(defaultValues, { keepErrors: true });
                prevDefaultValuesRef.current = defaultValues;
                prevValuesRef.current = defaultValues;
            }
        }
    }, [defaultValues, reset]);

    const gridClass = getGridClass(gridColumns);
    const defaultButtonColClass =
        gridColumns === 12 ? 'col-span-12 sm:col-span-6 md:col-span-4' : 'col-span-2';
    const buttonColClass = buttonGridColumn
        ? getColSpanClass(gridColumns, buttonGridColumn)
        : defaultButtonColClass;

    const renderedFields = (fields || []).map((field) =>
        renderFieldElement({
            field,
            fieldPrefix,
            gridColumns,
            control,
            register,
            setValue,
            watch,
            errors,
        })
    );

    if (standalone) {
        return (
            <FormProvider {...activeContext}>
                <div className={`grid ${gridClass} gap-4 ${className}`}>{renderedFields}</div>
            </FormProvider>
        );
    }

    return (
        <form
            id={formId}
            onSubmit={handleSubmit ? handleSubmit((data) => onSubmit?.(data, activeContext)) : undefined}
            onReset={(e) => { e.preventDefault(); reset?.(); }}
            className={className}
            noValidate
        >
            <FormProvider {...activeContext}>
                <div className={`grid ${gridClass} gap-4`}>
                    {renderedFields}
                    {buttonPosition === "inline" && children && (
                        <div className={`self-end flex items-center gap-2 h-9 pb-0.5 ${buttonColClass} ${buttonClassName}`}>
                            {children}
                        </div>
                    )}
                </div>
                {buttonPosition === "bottom" && children && (
                    <div className={`flex justify-center gap-2 mt-5 w-full ${buttonClassName}`}>
                        {children}
                    </div>
                )}
            </FormProvider>
        </form>
    );
};

export default FormGenerator;
