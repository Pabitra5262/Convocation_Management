import { Button } from "@/shared/components/ui/Button";
import React, { useState, useMemo, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import FormGenerator from '../FormGenerator';
import { generateZodSchema } from '../schemaUtils';
import Card, { CardBody, CardHeader } from '@/shared/components/layout/Card';
import { Alert } from '../../Alert';
import { Stepper } from '../../Stepper';
import type { FormField } from '../form.types';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, type LucideIcon } from 'lucide-react';

/* Step form laid out like hims-ui-new pages/StaffOnboardingPage.tsx (step mode):
   progress card (Stepper) · error summary · step card with a divider heading · centred Back / Previous / Next footer. */

interface Step {
    id: string;
    label: string;
    /** Shown under the step name in the progress bar and under the step heading. */
    description?: string;
    fields: FormField[];
}

interface MultiStepFormProps {
    steps: Step[];
    onSubmit: (data: Record<string, unknown>) => void;
    /** Adds a "Back to List" button on the left of the footer. */
    onCancel?: () => void;
    gridColumn?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Optional heading above the progress bar. */
    title?: string;
    icon?: LucideIcon;
    /** Label of the last step's button (default "Submit"). */
    submitLabel?: string;
    /** Label of the onCancel button (default "Back to List"). */
    cancelLabel?: string;
    /** Shows a spinner on the submit button while saving. */
    loading?: boolean;
}

const MultiStepForm: React.FC<Readonly<MultiStepFormProps>> = ({
    steps,
    onSubmit,
    onCancel,
    gridColumn = 2,
    title,
    icon: Icon,
    submitLabel = "Submit",
    cancelLabel = "Back to List",
    loading = false,
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    /** Problems in the current step after Next / Submit was pressed (shown above the step card). */
    const [stepErrors, setStepErrors] = useState<string[]>([]);
    const summaryRef = useRef<HTMLDivElement>(null);
    const topRef = useRef<HTMLDivElement>(null);

    const allFields = useMemo(() => steps.flatMap(step => step.fields), [steps]);
    const schema = useMemo(() => generateZodSchema(allFields), [allFields]);

    const computedDefaultValues = useMemo(() => {
        const defaults: Record<string, unknown> = {};
        allFields.forEach(field => {
            if (field.type === 'multiselect') {
                defaults[field.name] = [];
            } else if (field.type === 'checkbox') {
                defaults[field.name] = false;
            } else if (field.type === 'number') {
                defaults[field.name] = undefined;
            } else {
                defaults[field.name] = '';
            }
        });
        return defaults;
    }, [allFields]);

    const methods = useForm<Record<string, unknown>>({
        defaultValues: computedDefaultValues,
        resolver: zodResolver(schema),
        mode: 'onChange',
    });

    const { handleSubmit, trigger, getFieldState } = methods;

    const currentStepData = steps[currentStep];
    const isLastStep = currentStep === steps.length - 1;
    const isFirstStep = currentStep === 0;

    const goTo = (index: number) => {
        setCurrentStep(index);
        setStepErrors([]);
        topRef.current?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
    };

    /** Validates the current step; on failure lists its problems and moves focus to the summary. */
    const validateStep = async (): Promise<boolean> => {
        const fields = currentStepData.fields;
        const ok = await trigger(fields.map(f => f.name));
        if (ok) {
            setStepErrors([]);
            return true;
        }
        const messages = fields
            .map(f => {
                const message = getFieldState(f.name).error?.message;
                return message ? `${f.label ?? f.name}: ${message}` : null;
            })
            .filter((m): m is string => !!m);
        setStepErrors(messages);
        requestAnimationFrame(() => summaryRef.current?.focus());
        return false;
    };

    const handleNext = async () => {
        if (await validateStep()) goTo(currentStep + 1);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLastStep) return handleNext();
        if (await validateStep()) await handleSubmit((data) => onSubmit(data))();
    };

    return (
        <div ref={topRef} className="flex flex-col gap-6">
            {/* Progress */}
            <Card>
                {title && <CardHeader title={title} icon={Icon} />}
                <CardBody>
                    <Stepper steps={steps} current={currentStep} onStepClick={goTo} />
                </CardBody>
            </Card>

            {stepErrors.length > 0 && (
                <div ref={summaryRef} tabIndex={-1} className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-focus-ring">
                    <Alert tone="danger" title={`Please fix ${stepErrors.length} ${stepErrors.length === 1 ? 'field' : 'fields'} before ${isLastStep ? 'submitting' : 'continuing'}`}>
                        <ul className="list-disc pl-5">{stepErrors.map(m => <li key={m}>{m}</li>)}</ul>
                    </Alert>
                </div>
            )}

            <FormProvider {...methods}>
                <form onSubmit={handleFormSubmit} noValidate className="flex flex-col gap-6">
                    {/* Current step */}
                    <Card>
                        <CardHeader divider title={currentStepData.label} description={currentStepData.description ?? `Step ${currentStep + 1} of ${steps.length}`} />
                        <CardBody>
                            <FormGenerator
                                fields={currentStepData.fields}
                                onSubmit={() => { }}
                                gridColumns={gridColumn}
                                standalone={true}
                            />
                        </CardBody>
                    </Card>

                    {/* Navigation */}
                    <div className="flex flex-wrap items-center justify-center gap-3 pb-2">
                        {onCancel && (
                            <Button type="button" variant="outline" leftIcon={ArrowLeft} onClick={onCancel}>
                                {cancelLabel}
                            </Button>
                        )}
                        {!isFirstStep && (
                            <Button type="button" variant="outline" leftIcon={ChevronLeft} onClick={() => goTo(currentStep - 1)}>
                                Previous
                            </Button>
                        )}
                        {isLastStep ? (
                            <Button type="submit" variant="success" leftIcon={Check} loading={loading}>
                                {submitLabel}
                            </Button>
                        ) : (
                            <Button type="submit" rightIcon={ArrowRight}>
                                Next
                            </Button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};

export default MultiStepForm;
