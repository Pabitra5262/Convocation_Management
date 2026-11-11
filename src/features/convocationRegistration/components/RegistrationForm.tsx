import { FormProvider } from 'react-hook-form';
import { RotateCcw, Save, Send } from 'lucide-react';
import Card, { CardBody, CardHeader } from '@/shared/components/layout/Card';
import { Button, FormGenerator, UploadFile } from '@/shared/components/ui';
import { fileName } from '@/features/convocationCommon/services/store';
import type { RegistrationController } from '../hooks/useConvocationRegistration';

export function RegistrationForm({ controller }: { controller: RegistrationController }) {
  const fields = controller.fields.map(field => field.type === 'file' ? { ...field,
    render: (value: unknown, onChange: (value: unknown) => void, error?: string) => <div className="col-span-12 sm:col-span-1 md:col-span-2 lg:col-span-[var(--field-span)]" style={{ '--field-span': field.gridColumn ?? 3 } as import('react').CSSProperties}>
      <UploadFile label={field.label} value={value instanceof File ? value : fileName(value)} onChange={onChange} error={error} accept={field.accept} required={field.required} helpText={field.helpText} />
    </div>,
  } : field);
  return <Card className="mb-5">
    <CardHeader title={controller.editing ? 'Edit Student Registration' : 'Student Registration'} divider />
    <CardBody>
      <FormProvider {...controller.methods}>
        <form id={controller.formId} className="scroll-mt-6" noValidate onSubmit={event => { event.preventDefault(); void controller.submit(); }}>
          <FormGenerator standalone gridColumns={12} fields={fields} onSubmit={() => undefined} />
          <div className="mt-5 flex flex-wrap justify-start gap-2 border-t border-border pt-4">
            <Button variant="outline" leftIcon={RotateCcw} disabled={controller.busy} onClick={controller.reset}>Reset</Button>
            <Button variant="outline" leftIcon={Save} disabled={controller.busy} onClick={() => void controller.submit(true)}>Save as Draft</Button>
            <Button type="submit" leftIcon={Send} loading={controller.busy}>Final Submit</Button>
          </div>
        </form>
      </FormProvider>
    </CardBody>
  </Card>;
}
