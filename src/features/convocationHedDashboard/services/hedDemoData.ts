import { eventService } from '@/features/convocationEvents/services/eventService';
import { readData, row, updateData } from '@/features/convocationCommon/services/store';
import type { PageContext } from '@/features/convocationCommon/types';

const DEMO_KEY = 'hims.convocation.hed.demo.v1';
// Illustrative university totals for the client wireframe, not official statistics.
const dashboardSamples: Record<string, { eligible: number; submitted: number; pending: number; approved: number; distributed: number }> = {
  'Utkal University': { eligible: 1200, submitted: 1080, pending: 120, approved: 960, distributed: 840 },
  'Ravenshaw University': { eligible: 900, submitted: 810, pending: 90, approved: 720, distributed: 630 },
  'Sambalpur University': { eligible: 1050, submitted: 945, pending: 135, approved: 810, distributed: 675 },
  'Berhampur University': { eligible: 800, submitted: 720, pending: 120, approved: 600, distributed: 480 },
};
export function ensureHedDemoData() {
  if (localStorage.getItem(DEMO_KEY)) return;
  const { events, institutions } = eventService.load();
  const event = events.find(item => item.id === 'demo-convocation-1');
  if (!event || !readData().students.some(student => student.id === 'demo-student-1')) return;
  localStorage.setItem(DEMO_KEY, '1');
  updateData({ key: 'hed', label: 'HED Officer', studentId: '', institutionId: '' }, 'Load sample HED observations', data => {
    const samples = [
      { remark: 'Please provide the expected date for completing pending application verification.', response: '', status: 'Open' },
      { remark: 'Confirm the schedule for certificate distribution.', response: 'Certificate distribution is planned for the convocation ceremony. The coordination team is finalising the schedule.', status: 'Open' },
      { remark: 'Please confirm that seating arrangements have been reviewed.', response: 'The venue seating plan has been reviewed and reserved seating confirmed.', status: 'Closed' },
    ];
    samples.forEach((sample, index) => {
      const institution = institutions[index];
      const id = `demo-hed-observation-${index + 1}`;
      if (!institution || data.observations.some(item => item.id === id)) return;
      const date = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
      data.observations.push(row({ university: institution.name, eventId: event.id, remark: sample.remark,
        raisedOn: date(4), response: sample.response, respondedOn: sample.response ? date(2) : '',
        closedOn: sample.status === 'Closed' ? date(1) : '',
      }, sample.status, id));
    });
  });
}

/** Sample university totals for demo institutions; custom institutions use their saved records. */
export function universityProgressRows(ctx: PageContext, byEvent = false) {
  return ctx.institutions.flatMap(institution => {
    const students = ctx.data.students.filter(student => student.values.institutionId === institution.id);
    const events = byEvent ? ctx.events.filter(event => event.institutionIds.includes(institution.id)) : [undefined];
    return events.map(event => {
      const applications = ctx.data.applications.filter(application => students.some(student => student.id === application.values.studentId)
        && (!event || application.values.eventId === event.id));
      const submitted = applications.filter(application => application.status !== 'Draft');
      const approved = submitted.filter(application => application.status === 'Approved').length;
      const distributed = ctx.data.certificates.filter(certificate => ['Distributed', 'Collected'].includes(certificate.status)
        && submitted.some(application => application.id === certificate.values.applicationId)).length;
      const sample = institution.id.startsWith('demo-institution-') && (!event || event.id === 'demo-convocation-1')
        ? dashboardSamples[institution.name] : undefined;
      const totals = sample ?? { eligible: students.filter(student => student.values.eligible).length,
        submitted: submitted.length, pending: submitted.filter(application => !['Approved', 'Rejected'].includes(application.status)).length,
        approved, distributed };
      return row({ university: institution.name, institutionId: institution.id, eventId: event?.id ?? '',
        eventName: event?.name ?? 'All Convocations', ...totals,
        progress: totals.submitted ? Math.round(totals.distributed / totals.submitted * 100) : 0,
        milestone: totals.approved ? totals.distributed === totals.approved ? 'Distribution complete' : 'Certificate distribution pending' : 'Approval pending',
      }, event?.status ?? 'Active', event ? `${institution.id}-${event.id}` : institution.id);
    });
  });
}
