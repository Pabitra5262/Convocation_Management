import type { FormField } from '@/shared/components/ui/Forms';
import type { PageContext, PageDefinition } from '@/features/convocationCommon/types';
import { applicationColumns } from '@/features/convocationCommon/form-config/fieldHelpers';
import { registrationStatus } from '@/features/convocationEvents/services/eventService';

export const REGISTRATION_DEFAULTS = { attendance: 'In-person', guests: 0, declaration: false };

export const registrationFormConfig = (context: PageContext): FormField[] => {
  const student = context.data.students.find(item => item.id === context.actor.studentId);
  const events = context.events.filter(event => registrationStatus(event) === 'Open' && event.institutionIds.includes(student?.values.institutionId ?? ''));
  return [
    { name: 'eventId', type: 'select', label: 'Convocation Event', required: true, options: events.map(event => ({ value: event.id, label: event.name })), gridColumn: 3 },
    { name: 'name', type: 'text', label: 'Student Name', disabled: true, readOnly: true, gridColumn: 3 },
    { name: 'enrolment', type: 'text', label: 'Enrolment / Roll No.', disabled: true, readOnly: true, gridColumn: 3 },
    { name: 'program', type: 'text', label: 'Program / Course', disabled: true, readOnly: true, gridColumn: 3 },
    { name: 'branch', type: 'text', label: 'Branch / Specialization', disabled: true, readOnly: true, gridColumn: 3 },
    { name: 'passingYear', type: 'text', label: 'Passing Year / Batch', disabled: true, readOnly: true, gridColumn: 2 },
    { name: 'dob', type: 'text', label: 'Date of Birth', disabled: true, readOnly: true, gridColumn: 2 },
    { name: 'gender', type: 'text', label: 'Gender', disabled: true, readOnly: true, gridColumn: 2 },
    { name: 'apaarId', type: 'text', label: 'APAAR ID', disabled: true, readOnly: true, gridColumn: 3 },
    { name: 'email', type: 'email', label: 'Email ID', required: true, gridColumn: 3 },
    { name: 'mobile', type: 'tel', label: 'Mobile Number', required: true, maxLength: 10, gridColumn: 3 },
    { name: 'attendance', type: 'select', label: 'Attendance Preference', required: true, options: ['In-person', 'Virtual', 'In-Absentia'].map(value => ({ value, label: value })), gridColumn: 3 },
    { name: 'guests', type: 'number', label: 'Number of Guests', min: 0, gridColumn: 3 },
    { name: 'photo', type: 'file', label: 'Upload Photo', required: true, accept: '.jpg,.jpeg,.png', helpText: 'JPEG/PNG, maximum 1 MB', gridColumn: 3 },
    { name: 'supportingDocument', type: 'file', label: 'Supporting Document', accept: '.pdf,.jpg,.jpeg,.png', helpText: 'PDF/Image, maximum 2 MB', gridColumn: 3 },
    { name: 'address', type: 'textarea', label: 'Permanent Address', required: true, rows: 1, className: '!h-auto', gridColumn: 6 },
    { name: 'declaration', type: 'checkbox', label: 'I confirm the accuracy of my information and eligibility', required: true, gridColumn: 12 },
  ];
};

// Metadata remains available to the module's route and common workflow checks.
export const definition: PageDefinition = {
  key: 'registration', title: 'Register for Convocation', formTitle: 'Student Registration', path: '/convocation/registration',
  roles: ['candidate'], writers: ['candidate'], defaults: REGISTRATION_DEFAULTS, draft: true,
  fields: registrationFormConfig, columns: applicationColumns,
};

