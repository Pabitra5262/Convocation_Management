import type { FormField } from '@/shared/components/ui/Forms';
import type { Institution } from '../types';
import { EVENT_STATUSES } from '../types';

export const academicYears = (extra?: string) => {
  const year = Number(new Intl.DateTimeFormat('en', { timeZone: 'Asia/Kolkata', year: 'numeric' }).format(new Date()));
  const values = Array.from({ length: 6 }, (_, i) => `${year - 3 + i}-${year - 2 + i}`);
  if (extra && !values.includes(extra)) values.push(extra);
  return values.sort().map(value => ({ value, label: value }));
};
export const eventFormConfig = (institutions: Institution[], academicYear?: string): FormField[] => [
  { name: 'name', type: 'text', label: 'Event Name', required: true, maxLength: 150, gridColumn: 4 },
  { name: 'academicYear', type: 'select', label: 'Academic Year', required: true, options: academicYears(academicYear), gridColumn: 2 },
  { name: 'eventDate', type: 'date', label: 'Event Date', required: true, gridColumn: 2 },
  { name: 'startTime', type: 'time', label: 'Start Time', required: true, gridColumn: 2 },
  { name: 'endTime', type: 'time', label: 'End Time', required: true, gridColumn: 2 },
  { name: 'venue', type: 'text', label: 'Venue / Location', required: true, maxLength: 250, gridColumn: 4 },
  { name: 'registrationStart', type: 'date', label: 'Registration Start Date', required: true, gridColumn: 2 },
  { name: 'registrationEnd', type: 'date', label: 'Registration End Date', required: true, gridColumn: 2 },
  { name: 'status', type: 'select', label: 'Event Status', required: true, options: EVENT_STATUSES.map(value => ({ value, label: value })), gridColumn: 2 },
  { name: 'registrationOpen', type: 'checkbox', label: 'Is Registration Open', gridColumn: 2 },
  { name: 'institutionIds', type: 'multiselect', label: 'Participating Institutions', required: true, options: institutions.map(i => ({ value: i.id, label: i.name })), gridColumn: 6},
  { name: 'description', type: 'textarea', label: 'Event Description', required: true, rows: 1, maxLength: 2000, gridColumn: 6, className: '!h-auto' },
  
];
