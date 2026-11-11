import type { PageDefinition } from '@/features/convocationCommon/types';
export const definition: PageDefinition = {
  key: "progress",
  title: "University Progress",
  formTitle: "Progress Details",
  path: "/convocation/progress",
  roles: ["hed","super","admin","exam"],
  writers: [],
  readOnly: true,
  fields: () => [],
  columns: [{"name":"university","label":"University"},{"name":"eventName","label":"Convocation Event"},{"name":"submitted","label":"Submitted"},{"name":"approved","label":"Approved"},{"name":"distributed","label":"Distributed"},{"name":"milestone","label":"Pending Milestone"},{"name":"progress","label":"Progress %"}],
};

