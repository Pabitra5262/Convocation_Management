import { z } from 'zod';
import type { ConvocationEvent, ConvocationEventValues, EventStore } from '../types';
import { eventSchema, today } from '../validation/eventValidation';
import { addDemoData, legacyInstitutionNames } from './demoData';

// Local persistence until the Convocation API and institution master are supplied.
const STORAGE_KEY = 'hims.convocation.events.v1';
const DEMO_KEY = 'hims.convocation.events.demo.v1';
const storedEvent = z.object({
  id: z.string(), name: z.string(), description: z.string(), academicYear: z.string(), eventDate: z.string(),
  startTime: z.string(), endTime: z.string(), venue: z.string(), registrationStart: z.string(), registrationEnd: z.string(),
  institutionIds: z.array(z.string()), registrationOpen: z.boolean(), status: z.enum(['Draft', 'Scheduled', 'Completed', 'Cancelled']),
  createdAt: z.string(), updatedAt: z.string(),
});
const storedData = z.object({ events: z.array(storedEvent), institutions: z.array(z.object({ id: z.string(), name: z.string() })) });

export const eventService = {
  load(): EventStore {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = storedData.safeParse(raw ? JSON.parse(raw) : { events: [], institutions: [] });
    if (!parsed.success) throw new Error('Saved convocation data could not be read. Please contact support.');
    let renamed = false;
    parsed.data.institutions.forEach(institution => {
      const name = legacyInstitutionNames.get(institution.name);
      if (name) { institution.name = name; renamed = true; }
    });
    if (renamed) localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed.data));
    if (!localStorage.getItem(DEMO_KEY)) {
      const seeded = addDemoData(parsed.data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      localStorage.setItem(DEMO_KEY, '1');
      return seeded;
    }
    return parsed.data;
  },
  save(values: ConvocationEventValues, id?: string): EventStore {
    const data = this.load();
    const existing = id ? data.events.find(e => e.id === id) : undefined;
    if (id && !existing) throw new Error('This event no longer exists. Refresh the list.');
    if (existing && ['Completed', 'Cancelled'].includes(existing.status)) throw new Error('Completed and cancelled events are read-only.');
    const valid = eventSchema(data.events, data.institutions, existing).parse(values);
    const timestamp = new Date().toISOString();
    const event: ConvocationEvent = { ...valid, id: existing?.id ?? crypto.randomUUID(), createdAt: existing?.createdAt ?? timestamp, updatedAt: timestamp };
    data.events = existing ? data.events.map(e => e.id === id ? event : e) : [event, ...data.events];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  },
  toggle(id: string): EventStore {
    const event = this.load().events.find(e => e.id === id);
    if (!event) throw new Error('Event not found');
    return this.save({ ...event, registrationOpen: !event.registrationOpen }, id);
  },
  addInstitution(name: string): EventStore {
    const normalized = name.trim();
    if (!normalized || normalized.length > 200) throw new Error('Enter an institution name of at most 200 characters.');
    const data = this.load();
    if (data.institutions.some(i => i.name.toLowerCase() === normalized.toLowerCase())) throw new Error('This institution already exists.');
    data.institutions.push({ id: crypto.randomUUID(), name: normalized });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  },
};

export const registrationStatus = (event: ConvocationEvent): string => {
  if (event.status === 'Completed' || event.status === 'Cancelled') return 'Closed';
  if (event.status === 'Draft') return 'Not opened';
  if (today() < event.registrationStart) return 'Upcoming';
  if (today() > event.registrationEnd) return 'Closed';
  return event.registrationOpen ? 'Open' : 'Closed';
};
export const formatDate = (date: string) => date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
