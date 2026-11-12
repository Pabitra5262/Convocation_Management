import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Pencil, LockKeyhole, LockKeyholeOpen, X } from 'lucide-react';
import PageHeader from '@/shared/components/layout/PageHeader';
import Card, { CardBody, CardHeader } from '@/shared/components/layout/Card';
import { Badge, Button, DataTable, DialogModal, Modal, type Column } from '@/shared/components/ui';
import { useConvocationEvents } from '../hooks/useConvocationEvents';
import { EventForm } from '../components/EventForm';
import { type ConvocationEvent } from '../types';
import { formatDate, registrationStatus } from '../services/eventService';
import { today } from '../validation/eventValidation';
import { useRole } from '@/shared/ssb/SsbStore';
import { routes } from '@/app/routes/routeConfig';
import '../styles/convocationEvents.css';

export const EVENT_PATH = routes.convocationEvents.path;

export default function ConvocationConfiguration() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { eventId } = useParams();
  const store = useConvocationEvents();
  const { roleKey } = useRole();
  const canManage = roleKey === 'admin' || roleKey === 'exam' || roleKey === 'super';
  const [toggleTarget, setToggleTarget] = useState<ConvocationEvent | null>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [viewId, setViewId] = useState<string | null>(null);
  const [institutionsEventId, setInstitutionsEventId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const event = store.events.find(e => e.id === eventId);
  const creating = pathname.endsWith('/create');
  const editing = pathname.endsWith('/edit');
  const goBack = () => { void navigate(EVENT_PATH); };
  const editableEvent = editing && event && !['Completed', 'Cancelled'].includes(event.status) ? event : undefined;
  const editingEventId = editableEvent?.id;
  const viewedEvent = store.events.find(e => e.id === viewId) ?? (eventId && !creating && !editableEvent ? event : undefined);
  const institutionsEvent = store.events.find(e => e.id === institutionsEventId);
  const selectedInstitutions = store.institutions.filter(institution => institutionsEvent?.institutionIds.includes(institution.id));
  const closeView = () => { setViewId(null); if (eventId && !editableEvent) goBack(); };
  const resetForm = () => { setFormVersion(version => version + 1); if (eventId || creating) goBack(); };
  useEffect(() => {
    if (!editingEventId) return;
    const frame = requestAnimationFrame(() => formRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start',
    }));
    return () => cancelAnimationFrame(frame);
  }, [editingEventId]);
  const columns: Column<ConvocationEvent>[] = [
    { id: 'serial', header: 'Sl No', cell: (_row, index) => index + 1, width: 'w-20' },
    { id: 'name', header: 'Event Name', accessor: e => e.name, sortable: true, cell: e => <Button variant="link" onClick={() => setViewId(e.id)}>{e.name}</Button> },
    { id: 'academicYear', header: 'Academic Year', accessor: e => e.academicYear, sortable: true },
    { id: 'eventDate', header: 'Event Date', accessor: e => e.eventDate, cell: e => formatDate(e.eventDate), sortable: true },
    { id: 'registrationPeriod', header: 'Registration Period', accessor: e => `${formatDate(e.registrationStart)} – ${formatDate(e.registrationEnd)}` },
    { id: 'institutions', header: 'Institutions', accessor: e => store.institutions.filter(i => e.institutionIds.includes(i.id)).map(i => i.name).join(', '), cell: e => <Button variant="link" aria-label={`View institutions for ${e.name}`} onClick={() => setInstitutionsEventId(e.id)}>{e.institutionIds.length} institution{e.institutionIds.length === 1 ? '' : 's'}</Button> },
    { id: 'status', header: 'Event Status', accessor: e => e.status, cell: e => <Badge tone={e.status === 'Cancelled' ? 'danger' : e.status === 'Scheduled' ? 'info' : e.status === 'Completed' ? 'success' : 'neutral'} dot>{e.status}</Badge> },
    { id: 'registration', header: 'Registration', accessor: registrationStatus, cell: e => <Badge tone={registrationStatus(e) === 'Open' ? 'success' : 'neutral'} dot>{registrationStatus(e)}</Badge> },
  ];
  return <>
    <PageHeader title="Convocation Configuration"
      breadcrumbs={[{ label: 'Convocation', path: EVENT_PATH }, { label: 'Convocation Configuration' }]} />
    {store.error ? <div role="alert" className="rounded-lg border border-danger p-5"><p>{store.error}</p><Button variant="outline" onClick={store.refresh} className="mt-3">Retry</Button></div>
      : (creating || editing) && !canManage ? <p role="alert">Your role has view-only access to convocation events.</p>
      : eventId && !event ? <div role="alert"><p>Convocation event not found.</p><Button variant="outline" leftIcon={ArrowLeft} onClick={goBack}>Back to Events</Button></div>
      : <>
        {canManage && <div ref={formRef} className="mb-6 scroll-mt-6" tabIndex={-1}>
          <EventForm key={`${editableEvent?.id ?? 'create'}-${formVersion}`} inline event={editableEvent} events={store.events} institutions={store.institutions}
            onSave={store.save} onAddInstitution={store.addInstitution} onBack={resetForm} />
        </div>}
        <Card>
          <CardHeader title="Convocation Event List" divider />
          <CardBody>
        <DataTable className="convocation-events-table" data={store.events} columns={columns} rowKey={e => e.id} rowLabel={e => e.name} caption="Convocation Events" exportFileName="convocation-events"
          searchPlaceholder="Search convocation events…" emptyTitle="No convocation events found" emptyDescription=""
          actions={{ onView: e => setViewId(e.id),
            custom: e => canManage && !['Completed', 'Cancelled'].includes(e.status) ? [
              { id: 'edit', label: 'Edit Event', icon: Pencil, onClick: () => {
                if (editableEvent?.id === e.id) formRef.current?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
                else void navigate(`${EVENT_PATH}/${e.id}/edit`);
              } },
              ...(e.registrationOpen || (e.status === 'Scheduled' && today() >= e.registrationStart && today() <= e.registrationEnd) ? [{ id: 'toggle', label: e.registrationOpen ? 'Close Registration' : 'Open Registration', icon: e.registrationOpen ? LockKeyhole : LockKeyholeOpen, onClick: () => setToggleTarget(e) }] : []),
            ] : [] }} />
          </CardBody>
        </Card>
      </>}
    <Modal isOpen={!!institutionsEvent} onClose={() => setInstitutionsEventId(null)} title="Selected Institutions" size="lg">
      <p className="mb-4 font-semibold">{institutionsEvent?.name}</p>
      {selectedInstitutions.length ? <ul className="list-disc space-y-2 pl-5">
        {selectedInstitutions.map(institution => <li key={institution.id}>{institution.name}</li>)}
      </ul> : <p>No institutions selected.</p>}
      <div className="mt-5 flex justify-start border-t border-border pt-4">
        <Button variant="outline" leftIcon={X} onClick={() => setInstitutionsEventId(null)}>Close</Button>
      </div>
    </Modal>
    <Modal isOpen={!!viewedEvent} onClose={closeView} title="View Convocation Event" size="7xl">
      {viewedEvent && <EventForm key={`view-${viewedEvent.id}`} readOnly event={viewedEvent} events={store.events} institutions={store.institutions}
        onSave={() => false} onBack={closeView} onAddInstitution={() => false} />}
    </Modal>
    <DialogModal isOpen={!!toggleTarget} onClose={() => setToggleTarget(null)} title={toggleTarget?.registrationOpen ? 'Close registration?' : 'Open registration?'}
      message={<>{toggleTarget?.registrationOpen ? 'New student registrations will be restricted for' : 'Eligible students will be able to register for'} <strong>{toggleTarget?.name}</strong>.</>}
      confirmText={toggleTarget?.registrationOpen ? 'Close Registration' : 'Open Registration'}
      onConfirm={() => { if (toggleTarget && store.toggle(toggleTarget.id)) setToggleTarget(null); }} />
  </>;
}
