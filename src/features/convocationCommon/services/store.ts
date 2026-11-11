import { eventService, registrationStatus } from '@/features/convocationEvents/services/eventService';
import { today } from '@/features/convocationEvents/validation/eventValidation';
import { scheduledTime } from './dates';
import type { Actor, Application, DomainData, ModuleKey, PageContext, RecordRow, Student, Values } from '../types';

const KEY = 'convocation.lifecycle.v1';
const channel = 'convocation:data';
export const now = () => new Date().toISOString();
function check(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
const text = (value: unknown) => String(value ?? '').trim();
export const row = (values: Values, status = 'Draft', id: string = crypto.randomUUID()): RecordRow => ({ id, values, status, updatedAt: now() });
export const fileName = (value: unknown): string => value && typeof value === 'object' && 'name' in value ? String(value.name) : text(value);
export const fileData = (value: unknown): string => value && typeof value === 'object' && 'data' in value ? String(value.data) : '';

function seed(): DomainData {
  const { institutions, events } = eventService.load();
  const event = events.find(e => registrationStatus(e) === 'Open') ?? events[0];
  const names = ['Aarav Das', 'Ananya Mishra', 'Rohan Sahoo', 'Priya Nayak', 'Arjun Mohanty', 'Sneha Rout', 'Isha Patra', 'Dev Behera'];
  const states = ['Draft', 'Submitted', 'Under University Verification', 'Correction Required', 'Verified', 'Pending Approval', 'Approved', 'Approved'];
  const students: Student[] = names.map((name, i) => row({
    name, apaarId: `9000000000${String(i + 1).padStart(2, '0')}`, institutionId: institutions[i % Math.max(1, institutions.length)]?.id ?? '',
    program: i === 7 ? 'PhD' : i % 2 ? 'Postgraduate' : 'Undergraduate', branch: i % 2 ? 'Commerce' : 'Computer Science',
    passingYear: '2026', dob: `2000-0${i + 1}-15`, gender: i % 2 ? 'Female' : 'Male', enrolment: `ENR/2026/${i + 1}`,
    email: `student${i + 1}@example.test`, mobile: `900000000${i + 1}`, address: 'University Campus, Odisha', eligible: true,
  }, 'Eligible', `demo-student-${i + 1}`) as Student);
  const applications: Application[] = event ? students.map((student, i) => ({ ...row({
    studentId: student.id, eventId: event.id, attendance: i === 5 ? 'Virtual' : i === 4 ? 'In-Absentia' : 'In-person', guests: i < 4 ? 1 : 0,
    email: student.values.email, mobile: student.values.mobile, address: student.values.address, declaration: true, feeStatus: 'Paid', reason: i === 3 ? 'Upload a clear photograph.' : '',
    photo: { name: 'passport-photo.png', size: 50000, type: 'image/png' }, submittedOn: i ? now() : '',
  }, states[i], `REG-DEMO-${i + 1}`), history: [{ status: states[i], remark: 'Sample application', actor: 'University Examination Controller', date: now() }] } as Application)) : [];
  return { students, applications, certificates: [], awards: [], logistics: [], invitations: [], communications: [], observations: [], audit: [], notifications: [] };
}

export function readData(): DomainData {
  const saved = localStorage.getItem(KEY);
  if (!saved) { const data = seed(); localStorage.setItem(KEY, JSON.stringify(data)); return data; }
  const data = JSON.parse(saved) as DomainData;
  check(data && Array.isArray(data.students) && Array.isArray(data.applications) && Array.isArray(data.audit), 'Unable to read saved convocation data.');
  data.notifications ??= [];
  return data;
}
export function updateData(actor: Actor, action: string, change: (data: DomainData) => void) {
  const data = structuredClone(readData());
  change(data);
  data.audit.unshift(row({ action, actor: actor.label, date: now() }, 'Recorded'));
  localStorage.setItem(KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(channel));
}
export const subscribe = (listener: () => void) => { window.addEventListener(channel, listener); window.addEventListener('storage', listener); return () => { window.removeEventListener(channel, listener); window.removeEventListener('storage', listener); }; };
function notify(data: DomainData, title: string, studentId = '', audience = 'candidate') {
  data.notifications.unshift(row({ title, studentId, audience, read: false, date: now() }, 'Unread', String(Date.now() + data.notifications.length)));
}
function deliverInApp(data: DomainData, communication: RecordRow) {
  if (!Array.isArray(communication.values.channels) || !communication.values.channels.includes('In-app')) return;
  const recipients = communication.values.recipientIds as string[];
  recipients.forEach(id => {
    const app = data.applications.find(a => a.id === id); if (!app) return;
    const student = data.students.find(s => s.id === app.values.studentId);
    const event = eventService.load().events.find(e => e.id === app.values.eventId);
    const invitation = data.invitations.find(i => i.values.applicationId === id);
    const fields: Record<string,string> = { 'Student Name': student?.values.name ?? '', 'Event Date': event?.eventDate ?? '', 'Seat No.': String(invitation?.values.seat ?? ''), 'Registration ID': id };
    const body = String(communication.values.body).replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, key: string) => fields[key] ?? match);
    notify(data, `${communication.values.subject ?? 'Convocation'}: ${body}`, app.values.studentId);
  });
  communication.values.inAppDeliveredOn = now();
  communication.values.delivery = recipients.map(registrationId => ({ registrationId, status: communication.values.channels && (communication.values.channels as string[]).length === 1 ? 'Sent (In-app)' : 'In-app Sent / Gateway Queued', reason: 'In-app notice available; external channels require notification gateway' }));
  if (communication.values.channels.length === 1) {
    communication.status = 'Sent';
    communication.values.delivery = recipients.map(registrationId => ({ registrationId, status: 'Sent (In-app)', reason: 'Available in student notifications' }));
  }
}
export function processDueCommunications() {
  const due = readData().communications.some(c => c.status === 'Scheduled' && new Date(String(c.values.scheduledAt)).getTime() <= Date.now());
  if (!due) return;
  updateData({ key: 'super', label: 'Notification Scheduler', studentId: '', institutionId: '' }, 'Queue scheduled communications', data => data.communications.forEach(communication => {
    if (communication.status === 'Scheduled' && new Date(String(communication.values.scheduledAt)).getTime() <= Date.now()) { communication.status = 'Queued'; deliverInApp(data, communication); }
  }));
}
export const canSeeStudent = (student: Student | undefined, actor: Actor) => !!student && (actor.key === 'candidate' ? student.id === actor.studentId : actor.key === 'college' ? student.values.institutionId === actor.institutionId : true);
export const scopedApplications = (data: DomainData, actor: Actor) => data.applications.filter(a => canSeeStudent(data.students.find(s => s.id === a.values.studentId), actor));
const appFor = (data: DomainData, id: string, actor: Actor) => { const app = scopedApplications(data, actor).find(a => a.id === id); check(app, 'Application not found or outside your scope.'); return app; };
export const applicationDisplay = (app: Application, data: DomainData, events = eventService.load().events): RecordRow => {
  const student = data.students.find(s => s.id === app.values.studentId);
  const certificate = data.certificates.find(c => c.values.applicationId === app.id);
  const invitation = data.invitations.find(c => c.values.applicationId === app.id);
  return { ...app, values: { ...student?.values, ...app.values, studentName: student?.values.name ?? '', eventName: events.find(e => e.id === app.values.eventId)?.name ?? '', registrationId: app.id, applicationStatus: app.status, certificateStatus: certificate?.status ?? 'Pending', seat: invitation?.values.seat ?? '', invitationStatus: invitation?.status ?? 'Pending', institutionId: student?.values.institutionId, photoName: fileName(app.values.photo) } };
};

export function readRows(key: ModuleKey, ctx: PageContext): RecordRow[] {
  const { data, actor, events } = ctx;
  if (key === 'students') return data.students.filter(s => canSeeStudent(s, actor));
  const apps = scopedApplications(data, actor);
  if (['registration', 'applications', 'verification', 'approvals', 'reports', 'participation'].includes(key)) {
    const filtered = key === 'verification' ? apps.filter(a => a.status !== 'Draft') : key === 'approvals' ? apps.filter(a => ['Verified', 'Pending Approval', 'Approved', 'Rejected'].includes(a.status)) : apps;
    return filtered.map(a => applicationDisplay(a, data, events));
  }
  if (key === 'certificates') return apps.filter(a => a.status === 'Approved').map(a => {
    const certificate = data.certificates.find(c => c.values.applicationId === a.id);
    const display = applicationDisplay(a, data, events);
    return { ...display, id: a.id, values: { ...display.values, ...certificate?.values, certificateType: certificate?.values.certificateType ?? 'Degree Certificate', generatedOn: certificate?.values.generatedOn ?? '', distributedOn: certificate?.values.distributedOn ?? '' }, status: certificate?.status ?? 'Pending' };
  });
  if (key === 'invitations') return apps.filter(a => a.status === 'Approved').map(a => {
    const invitation = data.invitations.find(i => i.values.applicationId === a.id);
    return { ...applicationDisplay(a, data, events), status: invitation?.status ?? 'Pending', values: { ...applicationDisplay(a, data, events).values, ...invitation?.values } };
  });
  if (key === 'hed') {
    const submitted = data.applications.filter(a => a.status !== 'Draft');
    const distributed = data.certificates.filter(c => ['Distributed','Collected'].includes(c.status)).length;
    return [row({ university: 'Demonstration University', eventName: 'All Convocations', eligible: data.students.filter(s => s.values.eligible).length,
      submitted: submitted.length, pending: submitted.filter(a => !['Approved','Rejected'].includes(a.status)).length,
      approved: submitted.filter(a => a.status === 'Approved').length, distributed, progress: submitted.length ? Math.round(distributed / submitted.length * 100) : 0,
    }, 'Active', 'demo-university')];
  }
  if (key === 'progress') return events.map(event => {
    const applications = data.applications.filter(a => a.values.eventId === event.id);
    const approved = applications.filter(a => a.status === 'Approved').length;
    const distributed = data.certificates.filter(c => ['Distributed','Collected'].includes(c.status) && applications.some(a => a.id === c.values.applicationId)).length;
    return row({ eventId: event.id, eventName: event.name, university: 'Demonstration University', eligible: data.students.filter(s => event.institutionIds.includes(s.values.institutionId)).length,
      submitted: applications.filter(a => a.status !== 'Draft').length, pending: applications.filter(a => !['Draft', 'Approved', 'Rejected'].includes(a.status)).length, approved, distributed,
      progress: applications.filter(a => a.status !== 'Draft').length ? Math.round(distributed / applications.filter(a => a.status !== 'Draft').length * 100) : 0, milestone: approved ? distributed === approved ? 'Distribution complete' : 'Certificate distribution pending' : 'Approval pending',
    }, event.status, event.id);
  });
  if (key === 'audit') return data.audit;
  if (key === 'awards') return data.awards.filter(a => apps.some(app => app.id === a.values.applicationId));
  if (key === 'observations') return data.observations;
  return data[key as 'logistics' | 'communications'] ?? [];
}

export function saveRecord(key: ModuleKey, values: Values, actor: Actor, id?: string, draft = false) {
  updateData(actor, `${key}: ${draft ? 'save draft' : 'save'}`, data => {
    if (key === 'students') {
      check(['admin', 'exam', 'super'].includes(actor.key), 'Student management access is required.');
      check(!data.students.some(s => s.id !== id && s.values.apaarId === values.apaarId), 'APAAR ID must be unique.');
      const record = row(values, values.eligible ? 'Eligible' : 'Not Eligible', id) as Student;
      data.students = id ? data.students.map(s => s.id === id ? record : s) : [...data.students, record]; return;
    }
    if (key === 'registration') {
      check(actor.key === 'candidate', 'Student registration must be submitted by the student.');
      const student = data.students.find(s => s.id === actor.studentId);
      const event = eventService.load().events.find(e => e.id === values.eventId);
      check(student?.values.eligible && event?.institutionIds.includes(student.values.institutionId), 'Student is not eligible for this event.');
      check(event && registrationStatus(event) === 'Open', 'Registration is not open for this event.');
      const existing = data.applications.find(a => a.values.studentId === student.id && a.values.eventId === event.id);
      check(!existing || ['Draft', 'Correction Required'].includes(existing.status), 'An application has already been submitted for this event.');
      check(!id || existing?.id === id, 'The selected application belongs to another event.');
      if (!draft) check(values.declaration && (values.photo || existing?.values.photo), 'Photograph and declaration are required.');
      const policy = data.logistics.find(l => l.values.eventId === event.id);
      check(Number(values.guests ?? 0) <= Number(policy?.values.guestLimit ?? 2), 'Guest count exceeds the event policy.');
      const status = draft ? existing?.status === 'Correction Required' ? 'Correction Required' : 'Draft' : 'Submitted';
      const application = { ...row({ ...existing?.values, ...values, studentId: student.id, guests: Number(values.guests ?? 0), feeStatus: existing?.values.feeStatus ?? 'Pending', reason: existing?.values.reason ?? '', submittedOn: draft ? existing?.values.submittedOn ?? '' : now() }, status, existing?.id ?? `REG-${crypto.randomUUID()}`), history: [...existing?.history ?? [], { status, remark: draft ? 'Draft saved' : 'Registration submitted', actor: actor.label, date: now() }] } as Application;
      data.applications = existing ? data.applications.map(a => a.id === existing.id ? application : a) : [...data.applications, application];
      if (!draft) { notify(data, `Application ${application.id} submitted successfully`, student.id); notify(data, `Application ${application.id} requires verification`, '', 'exam'); }
      return;
    }
    if (key === 'logistics') {
      check(['admin', 'exam', 'coordinator', 'super'].includes(actor.key), 'Logistics access is required.');
      const existing = data.logistics.find(l => l.values.eventId === values.eventId);
      const record = row(values, 'Configured', existing?.id ?? id);
      data.logistics = existing ? data.logistics.map(l => l.id === existing.id ? record : l) : [...data.logistics, record]; return;
    }
    if (key === 'communications') {
      check(['admin', 'coordinator', 'super', 'hed'].includes(actor.key), 'Communication access is required.');
      const source = data.applications.filter(a => a.status !== 'Draft' && (values.eventId === 'all' || a.values.eventId === values.eventId));
      const recipients = source.filter(a => values.group === 'All Registered' || values.group === a.values.attendance || values.group === 'Pending Verification' && ['Submitted', 'Under University Verification'].includes(a.status)
        || values.group === 'Specific Institution' && data.students.find(s => s.id === a.values.studentId)?.values.institutionId === values.institutionId
        || values.group === 'Custom Selection' && Array.isArray(values.recipientIds) && values.recipientIds.includes(a.id));
      check(recipients.length, 'No matching recipients.');
      const status = values.scheduledAt ? 'Scheduled' : 'Queued';
      const record = row({ ...values, scheduledAt: values.scheduledAt ? new Date(scheduledTime(values.scheduledAt)).toISOString() : '', recipientCount: recipients.length, recipientIds: recipients.map(a => a.id), delivery: recipients.map(a => ({ registrationId: a.id, status: 'Queued', reason: 'Awaiting notification gateway' })) }, status);
      data.communications.unshift(record); if (!values.scheduledAt) deliverInApp(data, record); return;
    }
    if (key === 'awards') {
      check(['admin', 'exam', 'super'].includes(actor.key), 'Award management access is required.');
      check(!id || data.awards.find(a => a.id === id)?.status === 'Nominated', 'Approved nominations are locked.');
      const app = appFor(data, text(values.applicationId), actor); check(app.status === 'Approved', 'Only approved students can be nominated.');
      const record = row({ ...values, studentName: data.students.find(s => s.id === app.values.studentId)?.values.name }, 'Nominated', id);
      data.awards = id ? data.awards.map(a => a.id === id ? record : a) : [...data.awards, record]; return;
    }
    if (key === 'observations') {
      check(['hed', 'super'].includes(actor.key), 'HED access is required to raise observations.');
      data.observations.unshift(row({ ...values, raisedOn: now(), response: '', respondedOn: '', closedOn: '' }, 'Open')); notify(data, `HED observation: ${values.remark}`, '', 'admin'); return;
    }
    throw new Error('This page is read-only.');
  });
}

const transitions: Record<string, { from: string[]; roles: string[] }> = {
  'Under University Verification': { from: ['Submitted'], roles: ['exam', 'faculty', 'super'] },
  'Correction Required': { from: ['Submitted', 'Under University Verification'], roles: ['exam', 'faculty', 'super'] },
  Verified: { from: ['Submitted', 'Under University Verification'], roles: ['exam', 'faculty', 'super'] },
  'Pending Approval': { from: ['Verified'], roles: ['exam', 'faculty', 'super'] },
  Approved: { from: ['Pending Approval'], roles: ['authority', 'super'] },
  Rejected: { from: ['Submitted', 'Under University Verification', 'Verified', 'Pending Approval'], roles: ['exam', 'faculty', 'authority', 'super'] },
};
export function transitionApplication(id: string, status: string, reason: string, actor: Actor) {
  updateData(actor, `Application ${id}: ${status}`, data => {
    const app = appFor(data, id, actor); const rule = transitions[status];
    check(rule?.roles.includes(actor.key) && rule.from.includes(app.status), 'This workflow action is not available for your role or application status.');
    if (['Rejected', 'Correction Required'].includes(status)) check(reason.trim(), 'A reason is required.');
    app.status = status; app.updatedAt = now(); app.values.reason = reason;
    app.history.push({ status, remark: reason, actor: actor.label, date: now() });
    notify(data, `${id}: ${status}${reason ? ` — ${reason}` : ''}`, app.values.studentId);
  });
}
export function certificateAction(ids: string[], action: 'generate' | 'distribute' | 'collect', actor: Actor, type = 'Degree Certificate', distributionDate = today()) {
  check(ids.length, 'Select at least one record.');
  check(['admin', 'exam', 'super'].includes(actor.key), 'Certificate management access is required.');
  updateData(actor, `Certificates: ${action}`, data => ids.forEach(id => {
    const app = appFor(data, id, actor); check(app.status === 'Approved', 'Final approval is required before certificate generation.');
    const certificate = data.certificates.find(c => c.values.applicationId === id);
    if (action === 'generate') {
      check(!certificate || certificate.status === 'Generated', 'Distributed certificates cannot be regenerated.');
      const record = row({ ...certificate?.values, applicationId: id, eventId: app.values.eventId, certificateType: type, certificateNumber: certificate?.values.certificateNumber ?? `CERT-${crypto.randomUUID()}`, generatedOn: now(), version: Number(certificate?.values.version ?? 0) + 1 }, 'Generated', certificate?.id);
      data.certificates = certificate ? data.certificates.map(c => c.id === certificate.id ? record : c) : [...data.certificates, record];
      notify(data, `Certificate ready for ${id}`, app.values.studentId);
    } else {
      check(certificate, 'Generate the certificate first.');
      check(action === 'collect' ? certificate.status === 'Distributed' : certificate.status === 'Generated', 'Certificate is not in the required status.');
      if (action === 'distribute') check(/^\d{4}-\d{2}-\d{2}$/.test(distributionDate) && distributionDate <= today() && distributionDate >= String(certificate.values.generatedOn).slice(0, 10), 'Distribution date must be between generation date and today.');
      certificate.status = action === 'collect' ? 'Collected' : 'Distributed'; certificate.values[action === 'collect' ? 'collectedOn' : 'distributedOn'] = action === 'collect' ? now() : distributionDate;
    }
  }));
}
export function allocateSeats(configId: string, actor: Actor) {
  check(['admin', 'exam', 'coordinator', 'super'].includes(actor.key), 'Logistics access is required.');
  updateData(actor, 'Allocate seats', data => {
    const config = data.logistics.find(l => l.id === configId); check(config, 'Save logistics configuration first.');
    const apps = data.applications.filter(a => a.status === 'Approved' && a.values.eventId === config.values.eventId && a.values.attendance === 'In-person');
    check(apps.length, 'No approved in-person participants.');
    const sorted = [...apps].sort((a, b) => {
      const aStudent = data.students.find(s => s.id === a.values.studentId)!; const bStudent = data.students.find(s => s.id === b.values.studentId)!;
      return (config.values.mode === 'Auto by Program' ? aStudent.values.program.localeCompare(bStudent.values.program) : 0) || aStudent.values.name.localeCompare(bStudent.values.name);
    });
    check(config.values.mode !== 'Manual', 'Use manual seat assignment from Invitations & Entry Passes.');
    const requested = sorted.reduce((sum, a) => sum + 1 + Number(a.values.guests), 0);
    check(requested <= Number(config.values.totalSeats) - Number(config.values.reservedSeats ?? 0), 'Venue capacity is insufficient for students and guests.');
    let seat = Number(config.values.reservedSeats ?? 0) + 1;
    sorted.forEach(app => {
      check(Number(app.values.guests) <= Number(config.values.guestLimit), 'A registration exceeds the configured guest limit.');
      const existing = data.invitations.find(i => i.values.applicationId === app.id);
      const record = row({ ...existing?.values, applicationId: app.id, eventId: app.values.eventId, seat: `S-${seat}`, guestSeats: Array.from({ length: Number(app.values.guests) }, () => `S-${++seat}`).join(', ') }, 'Allocated', existing?.id);
      seat++; data.invitations = existing ? data.invitations.map(i => i.id === existing.id ? record : i) : [...data.invitations, record];
    }); config.status = 'Seats Allocated';
  });
}
export function invitationAction(ids: string[], action: 'generate' | 'acknowledge', actor: Actor) {
  check(ids.length, 'Select at least one record.');
  check(action === 'generate' ? ['admin', 'exam', 'coordinator', 'super'].includes(actor.key) : actor.key === 'candidate', 'Invitation action is not available for this role.');
  updateData(actor, `Invitations: ${action}`, data => ids.forEach(id => {
    const app = appFor(data, id, actor); check(app.status === 'Approved', 'Only approved registrations can receive invitations.');
    const existing = data.invitations.find(i => i.values.applicationId === id);
    if (app.values.attendance === 'In-person') check(existing?.values.seat, 'Allocate a seat before generating an in-person invitation.');
    if (action === 'acknowledge') check(existing && ['Generated', 'Acknowledged'].includes(existing.status), 'Generate the invitation first.');
    const record = row({ ...existing?.values, applicationId: id, eventId: app.values.eventId, generatedOn: existing?.values.generatedOn ?? now() }, action === 'generate' ? 'Generated' : 'Acknowledged', existing?.id);
    data.invitations = existing ? data.invitations.map(i => i.id === existing.id ? record : i) : [...data.invitations, record];
    if (action === 'generate') notify(data, `Convocation invitation ready for ${id}`, app.values.studentId);
  }));
}
export function assignManualSeat(id: string, seat: number, actor: Actor) {
  check(['admin', 'exam', 'coordinator', 'super'].includes(actor.key), 'Logistics access is required.');
  updateData(actor, 'Assign manual seat', data => {
    const app = appFor(data, id, actor); const config = data.logistics.find(l => l.values.eventId === app.values.eventId);
    check(app.status === 'Approved' && app.values.attendance === 'In-person' && config, 'Approved in-person registration and seating configuration are required.');
    check(Number.isInteger(seat) && seat > Number(config.values.reservedSeats ?? 0) && seat + Number(app.values.guests) <= Number(config.values.totalSeats), 'Seat range exceeds available capacity or overlaps reserved seats.');
    const seats = Array.from({ length: 1 + Number(app.values.guests) }, (_, i) => `S-${seat + i}`);
    check(!data.invitations.some(i => i.values.applicationId !== id && i.values.eventId === app.values.eventId && [i.values.seat, ...text(i.values.guestSeats).split(', ')].some(s => seats.includes(text(s)))), 'One or more seats are already allocated.');
    const existing = data.invitations.find(i => i.values.applicationId === id);
    const record = row({ ...existing?.values, applicationId: id, eventId: app.values.eventId, seat: seats[0], guestSeats: seats.slice(1).join(', ') }, 'Allocated', existing?.id);
    data.invitations = existing ? data.invitations.map(i => i.id === existing.id ? record : i) : [...data.invitations, record];
  });
}
export function observationAction(id: string, action: 'respond' | 'close', response: string, actor: Actor) {
  updateData(actor, `Observation: ${action}`, data => {
    const record = data.observations.find(o => o.id === id); check(record && record.status !== 'Closed', 'Observation is closed or not found.');
    if (action === 'respond') { check(['admin', 'exam', 'super'].includes(actor.key) && response.trim(), 'A university response is required.'); record.values.response = response; record.values.respondedOn = now(); record.status = 'Responded'; }
    else { check(['hed', 'super'].includes(actor.key) && record.values.response, 'HED must review a university response before closure.'); record.status = 'Closed'; record.values.closedOn = now(); }
    notify(data, action === 'respond' ? 'University responded to an HED observation' : 'HED observation closed', '', action === 'respond' ? 'hed' : 'admin');
  });
}
export const moduleService = (key: ModuleKey) => ({ read: (context: PageContext) => readRows(key, context), save: (values: Values, actor: Actor, id?: string, draft?: boolean) => saveRecord(key, values, actor, id, draft) });
export function approveAward(id: string, actor: Actor) {
  check(['authority', 'super'].includes(actor.key), 'Competent authority approval is required.');
  updateData(actor, 'Finalize award list', data => {
    const award = data.awards.find(a => a.id === id); check(award?.status === 'Nominated', 'Nomination is not pending approval.');
    award.status = 'Approved'; award.updatedAt = now();
  });
}
