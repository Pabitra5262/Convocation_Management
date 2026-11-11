import type { PageDefinition } from '@/features/convocationCommon/types';
export const definition: PageDefinition = {
  key: "audit",
  title: "Audit Trail",
  formTitle: "Audit Details",
  path: "/convocation/audit",
  roles: ["admin","exam","super","hed"],
  writers: [],
  readOnly: true,
  fields: () => [],
  columns: [{"name":"action","label":"Action"},{"name":"actor","label":"Actor"},{"name":"date","label":"Date / Time"}],
};

