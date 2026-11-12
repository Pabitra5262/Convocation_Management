import type { ConvocationEvent, EventStore } from '../types';
import { today } from '../validation/eventValidation';

export const odishaInstitutionNames = [
  'Utkal University',
  'Ravenshaw University',
  'Sambalpur University',
  'Berhampur University',
];

// Rename only the former sample labels, preserving IDs and existing selections.
export const legacyInstitutionNames = new Map([
  ['Utkal University', odishaInstitutionNames[0]],
  ['Ravenshaw University', odishaInstitutionNames[1]],
  ['Sambalpur University', odishaInstitutionNames[2]],
  ['Berhampur University', odishaInstitutionNames[3]],
]);

/** Sample events with real Odisha institution names. Dates are relative to the first load. */
export const addDemoData = (existing: EventStore): EventStore => {
  const date = (offset: number) => {
    const value = new Date(`${today()}T12:00:00Z`);
    value.setUTCDate(value.getUTCDate() + offset);
    return value.toISOString().slice(0, 10);
  };
  const academicYear = (eventDate: string) => {
    const year = Number(eventDate.slice(0, 4)) - (Number(eventDate.slice(5, 7)) < 7 ? 1 : 0);
    return `${year}-${year + 1}`;
  };
  const institutions = [...existing.institutions];
  const ids = odishaInstitutionNames.map((name, index) => {
    const found = institutions.find(i => i.name.trim().toLowerCase() === name.toLowerCase());
    if (found) return found.id;
    const id = `demo-institution-${index + 1}`;
    // Preserve any user-created record, including a coincidentally matching ID.
    const uniqueId = institutions.some(i => i.id === id) ? crypto.randomUUID() : id;
    institutions.push({ id: uniqueId, name });
    return uniqueId;
  });
  const timestamp = new Date().toISOString();
  const event = (index: number, name: string, eventOffset: number, startOffset: number, endOffset: number,
    status: ConvocationEvent['status'], registrationOpen: boolean, venue: string, institutionIds: string[]): ConvocationEvent => ({
    id: `demo-convocation-${index}`, name, description: `${name} for eligible graduates of participating institutions.`,
    academicYear: academicYear(date(eventOffset)), eventDate: date(eventOffset), startTime: '10:00', endTime: '13:00', venue,
    registrationStart: date(startOffset), registrationEnd: date(endOffset), institutionIds, status, registrationOpen,
    createdAt: timestamp, updatedAt: timestamp,
  });
  const samples = [
    event(1, 'Annual Convocation', 45, -10, 25, 'Scheduled', true, 'University Main Auditorium', ids),
    event(2, 'Postgraduate Convocation', 60, 10, 40, 'Scheduled', false, 'Postgraduate Studies Auditorium', [ids[3]]),
    event(3, 'Special Convocation', 20, -20, -2, 'Scheduled', false, 'University Convention Hall', [ids[0], ids[1]]),
    event(4, 'Research Scholars Convocation', 90, 30, 70, 'Draft', false, 'University Senate Hall', [ids[3]]),
    event(5, 'Previous Annual Convocation', -90, -150, -110, 'Completed', false, 'University Main Auditorium', ids),
    event(6, 'Supplementary Convocation', 30, -15, 15, 'Cancelled', false, 'University Convention Hall', [ids[2]]),
  ];
  return {
    institutions,
    events: [...existing.events, ...samples.filter(sample => !existing.events.some(e => e.id === sample.id
      || (e.name.trim().toLowerCase() === sample.name.toLowerCase() && e.academicYear === sample.academicYear)))],
  };
};
