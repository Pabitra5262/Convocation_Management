import { z } from 'zod';
import type { FormField } from './form.types';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const URL_REGEX = /^https?:\/\/\S+$/;

const buildNumberFieldSchema = (customMessage: string, required?: boolean, min?: string | number, max?: string | number) => {
    let numberSchema = z.number({ message: customMessage });
    if (min !== undefined) {
        const parsedMin = typeof min === 'string' ? Number(min) : min;
        if (!Number.isNaN(parsedMin)) {
            numberSchema = numberSchema.min(parsedMin, { message: customMessage });
        }
    }
    if (max !== undefined) {
        const parsedMax = typeof max === 'string' ? Number(max) : max;
        if (!Number.isNaN(parsedMax)) {
            numberSchema = numberSchema.max(parsedMax, { message: customMessage });
        }
    }

    const base = z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const num = Number(val);
        return Number.isNaN(num) ? val : num;
    }, numberSchema);

    return required ? base : base.optional().nullable();
};

const buildStringFieldSchema = (field: FormField, customMessage: string, required?: boolean, validation?: FormField['validation']) => {
    let fieldSchema: z.ZodString = z.string({ message: customMessage });
    const { email, minLength, maxLength, pattern, message } = validation || {};

    if (field.type === 'email' || email) {
        fieldSchema = fieldSchema.regex(EMAIL_REGEX, { message: message || "Invalid email address" });
    }
    if (field.type === 'url') {
        fieldSchema = fieldSchema.regex(URL_REGEX, { message: message || "Invalid URL" });
    }
    if (minLength !== undefined) {
        fieldSchema = fieldSchema.min(minLength, {
            message: message || (minLength === 1 ? customMessage : `${field.label || field.name} must be at least ${minLength} characters`)
        });
    } else if (required) {
        fieldSchema = fieldSchema.min(1, { message: customMessage });
    }
    if (maxLength !== undefined) {
        fieldSchema = fieldSchema.max(maxLength, {
            message: message || `${field.label || field.name} must be at most ${maxLength} characters`
        });
    }
    if (pattern) {
        fieldSchema = fieldSchema.regex(new RegExp(pattern), { message: message || "Invalid format" });
    }

    if (!required) {
        return fieldSchema.optional().or(z.literal(''));
    }
    return fieldSchema;
};

const buildArrayFieldSchema = (required?: boolean, customMessage?: string) => {
    const arrSchema = z.array(z.union([z.string(), z.number()]));
    return required ? arrSchema.min(1, { message: customMessage }) : arrSchema.optional();
};

const buildFileFieldSchema = (required?: boolean, customMessage?: string) => {
    return required
        ? z.any().refine((val) => val !== undefined && val !== null, { message: customMessage })
        : z.any().optional();
};

const buildValidatedFieldSchema = (field: FormField, validation: NonNullable<FormField['validation']>) => {
    const { required, min, max, message } = validation;
    const customMessage = message || `${field.label || field.name} is required`;

    if (field.type === 'number') {
        return buildNumberFieldSchema(customMessage, required, min, max);
    }
    if (field.type === 'multiselect') {
        return buildArrayFieldSchema(required, customMessage);
    }
    if (field.type === 'file' || field.type === 'profile-upload') {
        return buildFileFieldSchema(required, customMessage);
    }
    return buildStringFieldSchema(field, customMessage, required, validation);
};

const buildRequiredFieldSchema = (field: FormField) => {
    const defaultMsg = `${field.label || field.name} is required`;
    if (field.type === 'number') {
        return z.preprocess((val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            const num = Number(val);
            return Number.isNaN(num) ? val : num;
        }, z.number({ message: defaultMsg }));
    }
    return z.string().min(1, { message: defaultMsg });
};

const buildFieldSchema = (field: FormField): z.ZodTypeAny => {
    if (field.validation) {
        return buildValidatedFieldSchema(field, field.validation);
    }
    if (field.required) {
        return buildRequiredFieldSchema(field);
    }
    return z.any().optional();
};

export const generateZodSchema = (fields: FormField[]) => {
    const schemaShape: Record<string, z.ZodTypeAny> = {};
    for (const field of fields) {
        schemaShape[field.name] = buildFieldSchema(field);
    }
    return z.object(schemaShape);
};
