export const EVENT_STATUSES = ['Draft', 'Scheduled', 'Completed', 'Cancelled'] as const;
export type EventStatus = typeof EVENT_STATUSES[number];
export interface ConvocationEventValues {
  name: string;
  description: string;
  academicYear: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  registrationStart: string;
  registrationEnd: string;
  institutionIds: string[];
  registrationOpen: boolean;
  status: EventStatus;
}
export interface ConvocationEvent extends ConvocationEventValues {
  id: string;
  createdAt: string;
  updatedAt: string;
}
export interface Institution { id: string; name: string }
export interface EventStore { events: ConvocationEvent[]; institutions: Institution[] }
export const EMPTY_EVENT: ConvocationEventValues = {
  name: '', description: '', academicYear: '', eventDate: '', startTime: '', endTime: '',
  venue: '', registrationStart: '', registrationEnd: '', institutionIds: [], registrationOpen: false, status: 'Draft',
};
