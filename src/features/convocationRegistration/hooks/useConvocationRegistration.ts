import { useCallback, useEffect, useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { useRole } from '@/shared/ssb/SsbStore';
import { fileName } from '@/features/convocationCommon/services/store';
import { serializeFiles } from '@/features/convocationCommon/validation/validatePage';
import { REGISTRATION_DEFAULTS, registrationFormConfig } from '../form-config/registrationFormConfig';
import { registrationService } from '../services/registrationService';
import { validate } from '../validation/registrationValidation';
import type { RegistrationFormValues, RecordRow, PageContext } from '../types';

export function useConvocationRegistration() {
  const { roleKey, role } = useRole();
  const [snapshot, setSnapshot] = useState(registrationService.load);
  const refresh = useCallback(() => setSnapshot(registrationService.load()), []);
  useEffect(() => registrationService.subscribe(refresh), [refresh]);
  const actor = { key: roleKey, label: role, studentId: snapshot.data.students[0]?.id ?? '', institutionId: snapshot.institutions[0]?.id ?? '' };
  const student = snapshot.data.students.find(item => item.id === actor.studentId);
  const [initialDraft] = useState(() => snapshot.data.applications.find(application => application.values.studentId === actor.studentId && ['Draft', 'Correction Required'].includes(application.status)));
  const [editing, setEditing] = useState<RecordRow | undefined>(initialDraft);
  const [viewed, setViewed] = useState<RecordRow | null>(null);
  const [busy, setBusy] = useState(false);
  const formId = useId();
  const methods = useForm<RegistrationFormValues>({ defaultValues: { ...REGISTRATION_DEFAULTS, ...student?.values, ...initialDraft?.values } });
  const values = useWatch({ control: methods.control });
  const context: PageContext = { ...snapshot, actor, values };
  const fields = registrationFormConfig(context);
  const canRegister = roleKey === 'candidate';
  const rows = canRegister ? registrationService.read(context) : [];

  const reset = () => { setEditing(undefined); methods.reset({ ...REGISTRATION_DEFAULTS, ...student?.values }); methods.clearErrors(); };
  const edit = (record: RecordRow) => {
    if (!canRegister || !['Draft', 'Correction Required'].includes(record.status)) return;
    setEditing(record); methods.reset(record.values as RegistrationFormValues); methods.clearErrors();
    requestAnimationFrame(() => document.getElementById(formId)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }));
  };
  const submit = async (draft = false) => {
    if (!canRegister || busy) return;
    const raw = methods.getValues();
    const errors = validate(fields, raw, draft);
    methods.clearErrors();
    Object.entries(errors).forEach(([name, message]) => methods.setError(name, { message }));
    if (Object.keys(errors).length) { methods.setFocus(Object.keys(errors)[0]); return; }
    setBusy(true);
    try {
      registrationService.save(await serializeFiles(raw), actor, editing?.id, draft);
      reset(); refresh(); toast.success(draft ? 'Draft saved' : 'Registration submitted');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to save registration'); }
    finally { setBusy(false); }
  };
  const downloadAcknowledgement = async (record: RecordRow) => {
    try { await registrationService.downloadAcknowledgement(record.id, actor); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to download acknowledgement'); }
  };
  const displayValue = (name: string, value: unknown) => name === 'eventId' ? snapshot.events.find(event => event.id === value)?.name ?? ''
    : typeof value === 'boolean' ? value ? 'Yes' : 'No' : value && typeof value === 'object' ? fileName(value) : String(value ?? '');
  return { ...snapshot, actor, context, fields, methods, values, editing, edit, viewed, setViewed, formId, canRegister, rows, busy, submit, reset, downloadAcknowledgement, displayValue };
}
export type RegistrationController = ReturnType<typeof useConvocationRegistration>;

