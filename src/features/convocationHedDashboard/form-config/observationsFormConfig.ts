import type { PageDefinition } from '@/features/convocationCommon/types';
import * as fields from '@/features/convocationCommon/form-config/fieldHelpers';
export const definition: PageDefinition = {
  key: "observations",
  title: "Observations & Responses",
  formTitle: "Raise Observation",
  path: "/convocation/observations",
  roles: ["hed","super","admin","exam"],
  writers: ["hed","super"],
  defaults: {"university":"Demonstration University"},
  fields: ctx => [
fields.field('university','University','select',4,{required:true,options:fields.options(['Demonstration University'])}),
fields.field('eventId','Convocation Event','select',4,{required:true,options:fields.eventOptions(ctx)}),
fields.field('remark','Observation Remark','textarea',12,{required:true,rows:2,className:'!h-auto',maxLength:2000})],
  columns: [{"name":"university","label":"University"},{"name":"eventId","label":"Convocation Event"},{"name":"remark","label":"Observation"},{"name":"raisedOn","label":"Raised On"},{"name":"response","label":"University Response"},{"name":"respondedOn","label":"Responded On"},{"name":"closedOn","label":"Closed On"}],
};

