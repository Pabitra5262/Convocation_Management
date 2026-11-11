import { beforeEach, describe, expect, it } from 'vitest';
import { eventService } from '@/features/convocationEvents/services/eventService';
import { allocateSeats, approveAward, assignManualSeat, certificateAction, invitationAction, observationAction, processDueCommunications, readData, readRows, saveRecord, scopedApplications, transitionApplication } from './store';
import type { Actor } from '../types';
import { validatePage } from '../validation/validatePage';

const actor = (key: string): Actor => ({ key, label: key, studentId: 'demo-student-1', institutionId: eventService.load().institutions[0].id });
beforeEach(() => localStorage.clear());
const approveFirst = () => {
  const app = readData().applications[0];
  saveRecord('registration', app.values, actor('candidate'), app.id);
  transitionApplication(app.id, 'Under University Verification', '', actor('exam'));
  transitionApplication(app.id, 'Verified', '', actor('exam'));
  transitionApplication(app.id, 'Pending Approval', '', actor('exam'));
  transitionApplication(app.id, 'Approved', '', actor('authority'));
  return readData().applications[0];
};
describe('Convocation SRS workflows', () => {
  it('connects registration, final approval, certificate generation and distribution', () => {
    const app = approveFirst();
    certificateAction([app.id], 'generate', actor('exam'));
    certificateAction([app.id], 'distribute', actor('exam'));
    certificateAction([app.id], 'collect', actor('exam'));
    expect(readData().certificates[0].status).toBe('Collected');
    const hed = readRows('hed', { data: readData(), actor: actor('hed'), ...eventService.load(), values: {} });
    expect(hed[0].values.distributed).toBe(1);
    expect(readData().applications[0].history.map(h => h.status)).toContain('Approved');
    expect(readData().audit.length).toBeGreaterThanOrEqual(8);
    expect(() => certificateAction([app.id], 'generate', actor('exam'))).toThrow('Distributed');
  });
  it('rejects duplicate final submissions and out-of-sequence approvals', () => {
    const app = readData().applications[0];
    saveRecord('registration', app.values, actor('candidate'), app.id);
    expect(() => saveRecord('registration', app.values, actor('candidate'), app.id)).toThrow('already');
    expect(() => transitionApplication(app.id, 'Approved', '', actor('authority'))).toThrow('workflow');
    expect(() => certificateAction([app.id], 'generate', actor('exam'))).toThrow('approval');
  });
  it('requires correction reasons and supports student resubmission', () => {
    const app = readData().applications[0]; saveRecord('registration', app.values, actor('candidate'), app.id);
    expect(() => transitionApplication(app.id, 'Correction Required', '', actor('exam'))).toThrow('reason');
    transitionApplication(app.id, 'Correction Required', 'Replace photograph', actor('exam'));
    saveRecord('registration', app.values, actor('candidate'), app.id);
    expect(readData().applications[0].status).toBe('Submitted');
  });
  it('restricts student and college access to their own records', () => {
    const data = readData();
    expect(scopedApplications(data, actor('candidate'))).toHaveLength(1);
    const college = actor('college');
    expect(scopedApplications(data, college).every(app => data.students.find(s => s.id === app.values.studentId)?.values.institutionId === college.institutionId)).toBe(true);
    expect(() => transitionApplication(data.applications[1].id, 'Verified', '', actor('candidate'))).toThrow();
    expect(() => saveRecord('logistics', {}, actor('college'))).toThrow('access');
  });
  it('allocates unique seats for students and guests and generates invitations', () => {
    const app = approveFirst();
    saveRecord('logistics', { eventId: app.values.eventId, totalSeats: 50, reservedSeats: 5, guestLimit: 2, mode: 'Auto Alphabetical' }, actor('admin'));
    allocateSeats(readData().logistics[0].id, actor('admin'));
    const invitations = readData().invitations;
    const allSeats = invitations.flatMap(i => [i.values.seat, ...String(i.values.guestSeats).split(', ').filter(Boolean)]);
    expect(new Set(allSeats).size).toBe(allSeats.length);
    invitationAction([app.id], 'generate', actor('admin'));
    invitationAction([app.id], 'acknowledge', actor('candidate'));
    expect(readData().invitations.find(i => i.values.applicationId === app.id)?.status).toBe('Acknowledged');
  });
  it('rejects insufficient capacity without partially allocating seats', () => {
    const app = approveFirst();
    saveRecord('logistics', { eventId: app.values.eventId, totalSeats: 1, reservedSeats: 0, guestLimit: 2, mode: 'Auto Alphabetical' }, actor('admin'));
    expect(() => allocateSeats(readData().logistics[0].id, actor('admin'))).toThrow('capacity');
    expect(readData().invitations).toEqual([]);
  });
  it('rejects overlapping manual seats', () => {
    const data = readData(); const approved = data.applications.filter(a => a.status === 'Approved');
    saveRecord('logistics', { eventId: approved[0].values.eventId, totalSeats: 20, reservedSeats: 2, guestLimit: 2, mode: 'Manual' }, actor('admin'));
    assignManualSeat(approved[0].id, 3, actor('admin'));
    expect(() => assignManualSeat(approved[1].id, 3, actor('admin'))).toThrow('already');
  });
  it('records HED observations, university responses and closure', () => {
    const eventId = eventService.load().events[0].id;
    saveRecord('observations', { eventId, university: 'Demonstration University', remark: 'Please explain pending certificates.' }, actor('hed'));
    const observation = readData().observations[0];
    expect(() => observationAction(observation.id, 'close', '', actor('hed'))).toThrow('response');
    observationAction(observation.id, 'respond', 'Certificates will be distributed at the ceremony.', actor('admin'));
    observationAction(observation.id, 'close', '', actor('hed'));
    expect(readData().observations[0].status).toBe('Closed');
  });
  it('queues communications without pretending that a gateway delivered them', () => {
    saveRecord('communications', { eventId: 'all', group: 'All Registered', channels: ['Email'], subject: 'Registration reminder', body: 'Dear {{Student Name}}' }, actor('admin'));
    const communication = readData().communications[0];
    expect(communication.status).toBe('Queued'); expect(communication.values.recipientCount).toBeGreaterThan(0);
    expect(JSON.stringify(communication.values.delivery)).not.toContain('Sent');
  });
  it('validates file size, media type, guest policy and scheduling', () => {
    const photo = new File([new Uint8Array(1024 * 1024 + 1)], 'photo.png', { type: 'image/png' });
    expect(validatePage('registration', [{ name: 'photo', type: 'file' }], { photo }).photo).toContain('1 MB');
    expect(validatePage('registration', [], { attendance: 'Virtual', guests: 1 }).guests).toBeTruthy();
    expect(validatePage('communications', [], { channels: ['Email'], scheduledAt: '2000-01-01' }).subject).toBeTruthy();
  });
  it('delivers in-app communications and keeps future schedules pending', () => {
    saveRecord('communications', { eventId: 'all', group: 'All Registered', channels: ['In-app'], subject: 'Reminder', body: 'Hello {{Student Name}}' }, actor('admin'));
    expect(readData().communications[0].status).toBe('Sent');
    expect(readData().notifications.some(n => String(n.values.title).includes('Hello Ananya Mishra'))).toBe(true);
    saveRecord('communications', { eventId: 'all', group: 'All Registered', channels: ['In-app'], subject: 'Scheduled', body: 'Notice', scheduledAt: '2099-01-01T10:00' }, actor('admin'));
    processDueCommunications();
    expect(readData().communications[0].status).toBe('Scheduled');
  });
  it('locks award nominations after competent authority approval', () => {
    const app = readData().applications.find(a => a.status === 'Approved')!;
    const values = { applicationId: app.id, award: 'Gold Medal', category: 'Gold Medal', remarks: 'Academic merit' };
    saveRecord('awards', values, actor('admin'));
    const nomination = readData().awards[0];
    expect(() => approveAward(nomination.id, actor('college'))).toThrow('authority');
    approveAward(nomination.id, actor('authority'));
    expect(() => saveRecord('awards', values, actor('admin'), nomination.id)).toThrow('locked');
  });
});
