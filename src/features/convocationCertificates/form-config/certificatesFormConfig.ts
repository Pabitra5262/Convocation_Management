import type { PageDefinition } from '@/features/convocationCommon/types';
export const definition: PageDefinition = {
  key: "certificates",
  title: "Certificate Management",
  formTitle: "Certificate Details",
  path: "/convocation/certificates",
  roles: ["admin","exam","college","candidate","super"],
  writers: [],
  readOnly: true,
  bulk: "generate",
  fields: () => [],
  columns: [{"name":"studentName","label":"Student Name"},{"name":"enrolment","label":"Enrolment No."},{"name":"eventName","label":"Convocation Event"},{"name":"program","label":"Program / Branch"},{"name":"certificateType","label":"Certificate Type"},{"name":"certificateNumber","label":"Certificate Number"},{"name":"generatedOn","label":"Generated On"},{"name":"distributedOn","label":"Distributed On"}],
};

