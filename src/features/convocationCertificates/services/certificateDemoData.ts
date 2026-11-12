import { readData, row, updateData } from '@/features/convocationCommon/services/store';

const DEMO_KEY = 'hims.convocation.certificates.demo.v1';

/** Add client-demo records once, without changing existing applications or certificates. */
export function ensureCertificateDemoData() {
  if (localStorage.getItem(DEMO_KEY)) return;
  const approved = readData().applications.filter(application => application.status === 'Approved'
    && ['REG-DEMO-7', 'REG-DEMO-8'].includes(application.id));
  if (!approved.length) return;
  localStorage.setItem(DEMO_KEY, '1');
  updateData({ key: 'super', label: 'Demo setup', studentId: '', institutionId: '' }, 'Load sample certificates and medal nominations', data => {
    const application = approved[0];
    const generatedOn = new Date().toISOString();
    if (!data.certificates.some(certificate => certificate.values.applicationId === application.id)) {
      data.certificates.push(row({ applicationId: application.id, eventId: application.values.eventId,
        certificateType: 'Degree Certificate', certificateNumber: 'DEMO-CERT-2026-001', generatedOn, version: 1,
      }, 'Generated', 'demo-certificate-1'));
    }
    approved.forEach((app, index) => {
      const id = `demo-award-${index + 1}`;
      if (data.awards.some(award => award.id === id || award.values.applicationId === app.id)) return;
      data.awards.push(row({ applicationId: app.id, eventId: app.values.eventId,
        studentName: data.students.find(student => student.id === app.values.studentId)?.values.name ?? '',
        award: index === 0 ? 'Academic Excellence Gold Medal' : 'Research Excellence Award',
        category: index === 0 ? 'Gold Medal' : 'Special Award',
        remarks: 'Sample nomination for the client wireframe.',
      }, index === 0 ? 'Nominated' : 'Approved', id));
    });
  });
}
