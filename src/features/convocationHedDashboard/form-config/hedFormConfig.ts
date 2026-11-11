import type { PageDefinition } from '@/features/convocationCommon/types';
export const definition: PageDefinition = {
  key: "hed",
  title: "HED Dashboard",
  formTitle: "University Progress",
  path: "/convocation/hed",
  roles: ["hed","super"],
  writers: [],
  readOnly: true,
  fields: () => [],
  columns: [{"name":"university","label":"University"},{"name":"eventName","label":"Convocation Event"},{"name":"eligible","label":"Eligible"},{"name":"submitted","label":"Submitted"},{"name":"pending","label":"Pending"},{"name":"approved","label":"Approved"},{"name":"distributed","label":"Distributed"},{"name":"progress","label":"Progress %"}],
};

