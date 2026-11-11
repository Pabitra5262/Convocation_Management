import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { eventSchema } from './eventValidation';
import { eventService, registrationStatus } from '../services/eventService';
import type { ConvocationEventValues } from '../types';

const values: ConvocationEventValues = {
  name: 'Annual Convocation', description: 'Graduation ceremony', academicYear: '2026-2027',
  eventDate: '2026-12-01', startTime: '10:00', endTime: '13:00', venue: 'University Auditorium',
  registrationStart: '2026-11-01', registrationEnd: '2026-11-30', institutionIds: ['institution'], registrationOpen: true, status: 'Scheduled',
};
const institutions = [{ id: 'institution', name: 'University' }];

describe('Convocation event business rules', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-11T06:00:00Z')); localStorage.clear(); localStorage.setItem('hims.convocation.events.demo.v1', '1'); });
  afterEach(() => vi.useRealTimers());
  it('accepts a scheduled event in its registration window', () => {
    expect(eventSchema([], institutions).safeParse(values).success).toBe(true);
  });
  it.each([
    { endTime: '09:00' }, { eventDate: '2026-11-10' }, { registrationEnd: '2026-12-02' },
    { registrationStart: '2026-12-01' }, { institutionIds: [] }, { institutionIds: ['unknown'] },
    { status: 'Draft' }, { status: 'Completed', registrationOpen: false },
    { eventDate: '2026-02-30' }, { academicYear: '2026-2028' },
  ])('rejects invalid event configuration %j', change => {
    expect(eventSchema([], institutions).safeParse({ ...values, ...change }).success).toBe(false);
  });
  it('rejects duplicate names within the year but allows editing the same event', () => {
    const existing = { ...values, id: 'event', createdAt: '', updatedAt: '' };
    expect(eventSchema([existing], institutions).safeParse({ ...values, name: ' annual convocation ' }).success).toBe(false);
    expect(eventSchema([existing], institutions, existing).safeParse(values).success).toBe(true);
  });
  it('persists user-entered events, updates them and closes registration', () => {
    const data = eventService.addInstitution('University');
    const input = { ...values, institutionIds: [data.institutions[0].id] };
    const created = eventService.save(input).events[0];
    expect(eventService.load().events[0].name).toBe(values.name);
    expect(registrationStatus(created)).toBe('Open');
    eventService.save({ ...input, name: 'Updated Convocation' }, created.id);
    expect(eventService.load().events).toHaveLength(1);
    const closed = eventService.toggle(created.id).events[0];
    expect(registrationStatus(closed)).toBe('Closed');
  });
  it('does not report an expired registration as open', () => {
    expect(registrationStatus({ ...values, id: 'event', createdAt: '', updatedAt: '', registrationEnd: '2026-11-10' })).toBe('Closed');
  });
  it('prevents reopening registrations outside the window', () => {
    const data = eventService.addInstitution('University');
    const event = eventService.save({ ...values, registrationOpen: false, institutionIds: [data.institutions[0].id], registrationEnd: '2026-11-10' }).events[0];
    expect(() => eventService.toggle(event.id)).toThrow();
  });
  it('starts empty and does not replace corrupt saved data', () => {
    expect(eventService.load()).toEqual({ events: [], institutions: [] });
    localStorage.setItem('hims.convocation.events.v1', 'corrupt');
    expect(() => eventService.load()).toThrow();
    expect(localStorage.getItem('hims.convocation.events.v1')).toBe('corrupt');
  });
  it('adds demo data once with varied registration statuses and preserves existing events', () => {
    const institution = eventService.addInstitution('Client Institution').institutions[0];
    const existing = eventService.save({ ...values, institutionIds: [institution.id] }).events[0];
    localStorage.removeItem('hims.convocation.events.demo.v1');
    const seeded = eventService.load();
    expect(seeded.events).toContainEqual(existing);
    expect(seeded.institutions).toContainEqual(institution);
    expect(new Set(seeded.events.map(registrationStatus))).toEqual(new Set(['Open', 'Closed', 'Upcoming', 'Not opened']));
    expect(new Set(seeded.events.map(e => e.status))).toEqual(new Set(['Scheduled', 'Draft', 'Completed', 'Cancelled']));
    expect(eventService.load()).toEqual(seeded);
    for (const event of seeded.events.filter(e => e.status === 'Draft' || e.status === 'Scheduled')) {
      expect(eventSchema(seeded.events, seeded.institutions, event).safeParse(event).success).toBe(true);
    }
  });
});
