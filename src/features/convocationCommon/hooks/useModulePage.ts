import { useCallback, useEffect, useId, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { useRole } from '@/shared/ssb/SsbStore';
import type { FormField } from '@/shared/components/ui/Forms';
import { eventService } from '@/features/convocationEvents/services/eventService';
import { canSeeStudent, fileName, readData, subscribe } from '../services/store';
import { serializeFiles } from '../validation/validatePage';
import type { PageContext, PageDefinition, PageService, RecordRow, Values } from '../types';

export type Validator = (fields: FormField[], values: Values, draft?: boolean) => Record<string, string>;
export function useModulePage(definition: PageDefinition, service: PageService, validate: Validator) {
  const { roleKey, role } = useRole();
  const [searchParams] = useSearchParams();
  const [snapshot, setSnapshot] = useState(() => ({ data: readData(), ...eventService.load() }));
  const refresh = useCallback(() => setSnapshot({ data: readData(), ...eventService.load() }), []);
  useEffect(() => subscribe(refresh), [refresh]);
  const actor = { key: roleKey, label: role, studentId: snapshot.data.students[0]?.id ?? '', institutionId: snapshot.institutions[0]?.id ?? '' };
  const student = snapshot.data.students.find(s => s.id === actor.studentId);
  const initial = definition.key === 'registration' ? snapshot.data.applications.find(a => a.values.studentId === actor.studentId && ['Draft', 'Correction Required'].includes(a.status)) : undefined;
  const initialValues = { ...definition.defaults, ...(definition.key === 'registration' ? { ...student?.values, ...initial?.values } : {}) };
  const [editing, setEditing] = useState<RecordRow | undefined>(initial);
  const [viewed, setViewed] = useState<RecordRow | null>(null);
  const [busy, setBusy] = useState(false);
  const methods = useForm<Values>({ defaultValues: initialValues });
  const values = useWatch({ control: methods.control }) as Values;
  const context: PageContext = { ...snapshot, actor, values };
  const fields = definition.fields(context);
  const allowed = definition.roles.includes(actor.key);
  const canWrite = allowed && definition.writers.includes(actor.key);
  const formId = useId();
  const [filters, setFilters] = useState({ eventId: searchParams.get('eventId') ?? '', status: '', institutionId: searchParams.get('institutionId') ?? '', program: '', attendance: '', certificateStatus: '' });
  const [applied, setApplied] = useState(filters);
  const [filtersHidden, setFiltersHidden] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const rows = allowed ? service.read(context) : [];
  const shown = rows.filter(r => Object.entries(applied).every(([key, value]) => !value || (key === 'eventId' && definition.key === 'students'
    ? snapshot.events.find(e => e.id === value)?.institutionIds.includes(String(r.values.institutionId))
    : String(key === 'status' ? r.status : r.values[key] ?? '') === value)));
  const displayValue = (key: string, value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (key === 'eventId') return snapshot.events.find(e => e.id === value)?.name ?? String(value);
    if (key === 'institutionId') return snapshot.institutions.find(i => i.id === value)?.name ?? String(value);
    if (key === 'applicationId') return snapshot.data.students.find(s => s.id === snapshot.data.applications.find(a => a.id === value)?.values.studentId)?.values.name ?? String(value);
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) return value.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ');
    if (typeof value === 'object') return fileName(value) || JSON.stringify(value);
    if (/^\d{4}-\d\d-\d\dT/.test(String(value))) return new Date(String(value)).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    return String(value);
  };
  const reset = () => { setEditing(undefined); methods.reset({ ...definition.defaults, ...(definition.key === 'registration' ? student?.values : {}) }); methods.clearErrors(); };
  const edit = (record: RecordRow) => {
    if (!canWrite) return;
    setEditing(record);
    methods.reset({ ...definition.defaults, ...record.values, ...Object.fromEntries(Object.entries(record.values).filter(([,v]) => v && typeof v === 'object' && 'name' in v).map(([k,v]) => [k, fileName(v)])) });
    requestAnimationFrame(() => document.getElementById(formId)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }));
  };
  const perform = async (operation: () => void | Promise<void>, success = 'Updated successfully') => {
    try { await operation(); setSelected([]); toast.success(success); refresh(); return true; }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Unable to complete the action'); return false; }
  };
  const submit = async (draft = false) => {
    if (!canWrite || busy) return;
    const raw = methods.getValues();
    const errors = validate(fields, raw, draft); methods.clearErrors();
    Object.entries(errors).forEach(([key, message]) => methods.setError(key, { message }));
    if (Object.keys(errors).length) { methods.setFocus(Object.keys(errors)[0]); return; }
    setBusy(true);
    await perform(async () => {
      const restored = { ...raw };
      for (const [key, value] of Object.entries(editing?.values ?? initial?.values ?? {})) if (value && typeof value === 'object' && 'name' in value && raw[key] === fileName(value)) restored[key] = value;
      const serialized = await serializeFiles(restored);
      service.save(serialized, actor, editing?.id, draft);
      reset();
    }, draft ? 'Draft saved' : definition.key === 'communications' ? 'Communication queued for the notification gateway' : 'Saved successfully');
    setBusy(false);
  };
  return { definition, ...context, context, fields, methods, values, allowed, canWrite, formId, rows, shown, filters, setFilters, applied, setApplied,
    filtersHidden, setFiltersHidden, selected, setSelected, editing, edit, reset, submit, busy, viewed, setViewed, perform, displayValue, refresh,
    scopedStudents: snapshot.data.students.filter(s => canSeeStudent(s, actor)) };
}
export type ModuleController = ReturnType<typeof useModulePage>;
