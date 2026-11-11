import type { FormField } from '@/shared/components/ui/Forms';
import type { ModuleKey, Values } from '../types';
import { scheduledTime } from '../services/dates';

export function validatePage(key: ModuleKey, fields: FormField[], values: Values, draft = false): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const value = values[field.name];
    const empty = value === undefined || value === null || value === '' || value === false || Array.isArray(value) && !value.length;
    if (field.required && empty && !draft) errors[field.name] = `${field.label} is required`;
    if (!empty && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) errors[field.name] = 'Enter a valid email address';
    if (!empty && field.type === 'tel' && !/^\d{10}$/.test(String(value))) errors[field.name] = 'Enter a valid 10-digit mobile number';
    if (!empty && field.type === 'number' && (!Number.isFinite(Number(value)) || !Number.isInteger(Number(value)) || Number(value) < Number(field.min ?? 0))) errors[field.name] = 'Enter a valid whole number';
    if (!empty && field.maxLength && typeof value === 'string' && value.length > field.maxLength) errors[field.name] = `Use at most ${field.maxLength} characters`;
    if (value instanceof File) {
      const max = field.name === 'photo' ? 1024 * 1024 : field.name === 'supportingDocument' ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
      if (value.size > max) errors[field.name] = `File exceeds ${max / 1024 / 1024} MB`;
      const allowed = field.name === 'photo' ? ['image/jpeg', 'image/png'] : ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowed.includes(value.type)) errors[field.name] = 'Unsupported file type';
    }
  }
  if (key === 'students') {
    if (!/^\d{12}$/.test(String(values.apaarId ?? ''))) errors.apaarId = 'Enter a 12-digit APAAR ID';
    if (values.dob && String(values.dob) >= new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })) errors.dob = 'Date of birth must be in the past';
  }
  if (key === 'registration' && values.attendance !== 'In-person' && Number(values.guests ?? 0) > 0) errors.guests = 'Guests apply only to in-person attendance';
  if (key === 'logistics' && Number(values.reservedSeats ?? 0) > Number(values.totalSeats)) errors.reservedSeats = 'Reserved seats cannot exceed total seats';
  if (key === 'communications') {
    const channels = Array.isArray(values.channels) ? values.channels : [];
    if ((channels.includes('Email') || channels.includes('In-app')) && !String(values.subject ?? '').trim()) errors.subject = 'Subject is required for Email and In-app notifications';
    if (values.scheduledAt && (!Number.isFinite(scheduledTime(values.scheduledAt)) || scheduledTime(values.scheduledAt) <= Date.now())) errors.scheduledAt = 'Schedule must be a valid future date and time';
    if (values.group === 'Specific Institution' && !values.institutionId) errors.institutionId = 'Select an institution';
    if (values.group === 'Custom Selection' && (!Array.isArray(values.recipientIds) || !values.recipientIds.length)) errors.recipientIds = 'Select recipients';
  }
  return errors;
}

export async function serializeFiles(values: Values): Promise<Values> {
  return Object.fromEntries(await Promise.all(Object.entries(values).map(async ([name, value]) => {
    if (!(value instanceof File)) return [name, value];
    const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Unable to read file')); reader.readAsDataURL(value); });
    return [name, { name: value.name, size: value.size, type: value.type, data }];
  })));
}
