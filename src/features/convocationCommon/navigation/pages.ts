import { moduleSections } from './sections';

/** Exactly eight primary screens, corresponding to SRS 4.71.1 through 4.71.8. */
export const srsScreens = [
  { key: 'events', title: 'Convocation Configuration', path: '/convocation/events', sections: [] as string[], roles: ['admin','exam','college','super'] },
  { key: 'registration', title: 'Student Registration', path: '/convocation/registration', sections: ['registration','applications','students'], roles: [] as string[] },
  { key: 'verification', title: 'Application Verification & Approval', path: '/convocation/verification', sections: ['verification','approvals'], roles: [] as string[] },
  { key: 'certificates', title: 'Certificate Preparation & Distribution', path: '/convocation/certificates', sections: ['certificates','awards'], roles: [] as string[] },
  { key: 'logistics', title: 'Event Logistics, Seating & Invitations', path: '/convocation/logistics', sections: ['logistics','invitations'], roles: [] as string[] },
  { key: 'reports', title: 'Participation Status & Reports', path: '/convocation/reports', sections: ['reports','participation','audit'], roles: [] as string[] },
  { key: 'communications', title: 'Communication Management', path: '/convocation/communications', sections: ['communications'], roles: [] as string[] },
  { key: 'hed', title: 'HED Monitoring, Observations & MIS', path: '/convocation/hed', sections: ['hed','progress','observations'], roles: [] as string[] },
];
export const modulePages = srsScreens.map(screen => ({ ...screen, roles: Array.from(new Set([...screen.roles,
  ...moduleSections.filter(section => screen.sections.includes(section.key)).flatMap(section => section.roles),
])) }));
export const legacySections = moduleSections.filter(section => !modulePages.some(page => page.path === section.path)).map(section => ({
  path: section.path, section: section.key, destination: modulePages.find(page => page.sections.includes(section.key))!.path,
}));
export const homeForRole = (role: string) => ['admin','exam','college','super'].includes(role) ? '/convocation/events'
  : role === 'hed' ? '/convocation/hed' : modulePages.find(page => page.roles.includes(role))?.path ?? '/convocation/events';
