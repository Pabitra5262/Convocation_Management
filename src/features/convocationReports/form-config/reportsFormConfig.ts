import type { PageDefinition } from '@/features/convocationCommon/types';
export const definition: PageDefinition = {
  key: "reports",
  title: "Participation / MIS Reports",
  formTitle: "Report Details",
  path: "/convocation/reports",
  roles: ["admin","exam","college","hed","super"],
  writers: [],
  readOnly: true,
  fields: () => [],
  columns: [{"name":"studentName","label":"Student Name"},{"name":"enrolment","label":"Enrolment No."},{"name":"institutionId","label":"Institution"},{"name":"program","label":"Program / Course"},{"name":"eventName","label":"Convocation Event"},{"name":"applicationStatus","label":"Registration Status"},{"name":"attendance","label":"Attendance Preference"},{"name":"seat","label":"Seat Number"},{"name":"certificateStatus","label":"Certificate Status"},{"name":"submittedOn","label":"Submission Date"}],
};

