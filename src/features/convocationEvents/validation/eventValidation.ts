import { z } from 'zod';
import type { ConvocationEvent, Institution } from '../types';

export const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value)
  && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
const date = z.string().refine(validDate, 'Select a valid date');
const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Select a valid time');

export const eventSchema = (events: ConvocationEvent[], institutions: Institution[], editing?: ConvocationEvent) => z.object({
  name: z.string().trim().min(1, 'Event name is required').max(150, 'Use at most 150 characters'),
  description: z.string().trim().min(1, 'Description is required').max(2000, 'Use at most 2000 characters'),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/, 'Select an academic year')
    .refine(v => Number(v.slice(5)) === Number(v.slice(0, 4)) + 1, 'Select a valid academic year'),
  eventDate: date,
  startTime: time,
  endTime: time,
  venue: z.string().trim().min(1, 'Venue is required').max(250, 'Use at most 250 characters'),
  registrationStart: date,
  registrationEnd: date,
  institutionIds: z.array(z.string()).min(1, 'Select at least one institution')
    .refine(ids => ids.every(id => institutions.some(i => i.id === id)), 'Select valid institutions'),
  registrationOpen: z.boolean(),
  status: z.enum(['Draft', 'Scheduled', 'Completed', 'Cancelled']),
}).superRefine((values, ctx) => {
  const issue = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message });
  if (values.eventDate < today() && values.eventDate !== editing?.eventDate) issue('eventDate', 'Event date must be today or later');
  if (values.endTime <= values.startTime) issue('endTime', 'End time must be after start time');
  if (values.registrationEnd < values.registrationStart) issue('registrationEnd', 'Registration end must be on or after registration start');
  if (values.registrationEnd > values.eventDate) issue('registrationEnd', 'Registration must end on or before the event date');
  if (events.some(e => e.id !== editing?.id && e.academicYear === values.academicYear && e.name.trim().toLowerCase() === values.name.toLowerCase())) {
    issue('name', 'An event with this name already exists in the academic year');
  }
  if (values.registrationOpen && values.status !== 'Scheduled') issue('registrationOpen', 'Only scheduled events can open registration');
  if (values.registrationOpen && (today() < values.registrationStart || today() > values.registrationEnd)) {
    issue('registrationOpen', 'Registration can open only within its registration period');
  }
  if (values.status === 'Completed' && values.eventDate > today()) issue('status', 'A future event cannot be marked completed');
});
