import { eventService, formatDate } from '@/features/convocationEvents/services/eventService';
import { readData, scopedApplications, updateData } from './store';
import type { Actor } from '../types';

export async function downloadDocument(id: string, kind: 'acknowledgement' | 'certificate' | 'invitation' | 'entry-pass', actor: Actor, preview = false): Promise<string | undefined> {
  const data = readData();
  const application = scopedApplications(data, actor).find(a => a.id === id);
  if (!application) throw new Error('Application is outside your scope.');
  const student = data.students.find(s => s.id === application.values.studentId)!;
  const event = eventService.load().events.find(e => e.id === application.values.eventId);
  if (!event) throw new Error('Convocation event not found.');
  const certificate = data.certificates.find(c => c.values.applicationId === id);
  const invitation = data.invitations.find(c => c.values.applicationId === id);
  if (kind === 'certificate' && !certificate) throw new Error('Certificate has not been generated.');
  if (['entry-pass', 'invitation'].includes(kind) && (!invitation || !['Generated', 'Acknowledged'].includes(invitation.status))) throw new Error('Invitation has not been generated.');
  if (kind === 'entry-pass' && (application.status !== 'Approved' || application.values.attendance !== 'In-person' || !invitation?.values.seat)) throw new Error('Entry passes require an approved in-person registration with a seat.');
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF();
  pdf.setFontSize(20); pdf.text(kind === 'certificate' ? String(certificate?.values.certificateType) : kind === 'entry-pass' ? 'Convocation Entry Pass' : kind === 'invitation' ? 'Convocation Invitation' : 'Registration Acknowledgement', 20, 28);
  pdf.setFontSize(12);
  const lines = [event.name, `Student: ${student.values.name}`, `Enrolment: ${student.values.enrolment}`, `Program: ${student.values.program} / ${student.values.branch}`, `Registration: ${id}`,
    `Event Date: ${formatDate(event.eventDate)}`, `Time: ${event.startTime} - ${event.endTime}`, `Venue: ${event.venue}`,
    `Attendance: ${application.values.attendance}`, `Seat: ${invitation?.values.seat ?? 'Not allocated'}`, `Guest Seats: ${invitation?.values.guestSeats ?? 'None'}`];
  if (kind === 'certificate') lines.push(`Certificate: ${certificate?.values.certificateNumber}`, `Generated: ${String(certificate?.values.generatedOn).slice(0, 10)}`);
  let y = 45; lines.forEach(line => { const wrapped = pdf.splitTextToSize(line, 170); if (y + wrapped.length * 7 > 230) { pdf.addPage(); y = 25; } pdf.text(wrapped, 20, y); y += wrapped.length * 7 + 2; });
  if (kind === 'entry-pass') {
    const QRCode = await import('qrcode');
    const qr = await QRCode.toDataURL(JSON.stringify({ registrationId: id, eventId: event.id, seat: invitation?.values.seat }), { errorCorrectionLevel: 'M', width: 240 });
    pdf.addImage(qr, 'PNG', 145, 235, 40, 40);
  }
  if (kind === 'certificate') { pdf.setFontSize(10); pdf.text('Wireframe preview - unsigned sample certificate', 20, 280); }
  if (preview) return String(pdf.output('bloburl'));
  pdf.save(`${kind}-${student.values.enrolment.replace(/\W/g, '-')}.pdf`);
  updateData(actor, `Download ${kind}: ${id}`, () => undefined);
}

export function communicationPreview(body: string, id?: string): string {
  const data = readData();
  const app = data.applications.find(a => a.id === id) ?? data.applications[0];
  const student = data.students.find(s => s.id === app?.values.studentId);
  const event = eventService.load().events.find(e => e.id === app?.values.eventId);
  const invitation = data.invitations.find(i => i.values.applicationId === app?.id);
  const replacements: Record<string, string> = { 'Student Name': student?.values.name ?? '', 'Event Date': event ? formatDate(event.eventDate) : '', 'Seat No.': String(invitation?.values.seat ?? ''), 'Registration ID': app?.id ?? '' };
  return body.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, key: string) => replacements[key] ?? match);
}
