import { Badge, DetailList } from '@/shared/components/ui';
import Card from '@/shared/components/layout/Card';
import { formatDate, registrationStatus } from '../services/eventService';
import type { ConvocationEvent, Institution } from '../types';

export const EventDetails = ({ event, institutions }: { event: ConvocationEvent; institutions: Institution[] }) => <Card title="Convocation Event Details">
  <DetailList items={[
    { label: 'Event Name', value: event.name },
    { label: 'Description', value: <span className="whitespace-pre-wrap wrap-break-word">{event.description}</span> },
    { label: 'Academic Year', value: event.academicYear },
    { label: 'Event Date', value: formatDate(event.eventDate) },
    { label: 'Ceremony Time', value: `${event.startTime} – ${event.endTime}` },
    { label: 'Venue / Location', value: event.venue },
    { label: 'Registration Period', value: `${formatDate(event.registrationStart)} – ${formatDate(event.registrationEnd)}` },
    { label: 'Participating Institutions', value: institutions.filter(i => event.institutionIds.includes(i.id)).map(i => i.name).join(', ') },
    { label: 'Event Status', value: <Badge tone={event.status === 'Cancelled' ? 'danger' : 'info'}>{event.status}</Badge> },
    { label: 'Registration Status', value: <Badge tone={registrationStatus(event) === 'Open' ? 'success' : 'neutral'}>{registrationStatus(event)}</Badge> },
  ]} />
</Card>;
