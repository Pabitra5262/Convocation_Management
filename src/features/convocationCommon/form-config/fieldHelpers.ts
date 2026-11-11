import type { FormField } from '@/shared/components/ui/Forms';
import type { PageContext } from '../types';
import { registrationStatus } from '@/features/convocationEvents/services/eventService';

export const options = (values: string[]) => values.map(value => ({ value, label: value }));
export const eventOptions = (ctx: PageContext, openOnly = false) => ctx.events.filter(e => !openOnly || registrationStatus(e) === 'Open').map(e => ({ value: e.id, label: e.name }));
export const institutionOptions = (ctx: PageContext) => ctx.institutions.map(i => ({ value: i.id, label: i.name }));
export const approvedOptions = (ctx: PageContext) => ctx.data.applications.filter(a => a.status === 'Approved').map(a => ({ value: a.id, label: `${a.id} — ${ctx.data.students.find(s => s.id === a.values.studentId)?.values.name ?? ''}` }));
export const field = (name: string, label: string, type: FormField['type'] = 'text', gridColumn = 3, extra: Partial<FormField> = {}): FormField => ({ name, type, label, gridColumn,
  wrapperClassName: gridColumn >= 6 ? 'sm:max-md:!col-span-2 md:max-lg:!col-span-4' : 'sm:max-md:!col-span-1 md:max-lg:!col-span-2', ...extra });
export const applicationColumns = [{ name: 'registrationId', label: 'Registration ID' }, { name: 'studentName', label: 'Student Name' }, { name: 'enrolment', label: 'Enrolment No.' }, { name: 'eventName', label: 'Convocation Event' }, { name: 'program', label: 'Program' }, { name: 'applicationStatus', label: 'Application Status' }, { name: 'feeStatus', label: 'Fee Status' }];
