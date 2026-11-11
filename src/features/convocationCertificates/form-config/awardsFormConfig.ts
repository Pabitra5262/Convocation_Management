import type { PageDefinition } from '@/features/convocationCommon/types';
import * as fields from '@/features/convocationCommon/form-config/fieldHelpers';
export const definition: PageDefinition = {
  key: "awards",
  title: "Degree & Medal Management",
  formTitle: "Medal / Special Award Nomination",
  path: "/convocation/awards",
  roles: ["admin","exam","college","super","authority"],
  writers: ["admin","exam","super"],
  fields: ctx => [
fields.field('applicationId','Approved Student','select',4,{required:true,options:fields.approvedOptions(ctx)}),
fields.field('award','Medal / Award Name','text',4,{required:true,maxLength:150}),
fields.field('category','Award Category','select',4,{required:true,options:fields.options(['Gold Medal','Silver Medal','Special Award'])}),
fields.field('remarks','Nomination Remarks','textarea',12,{required:true,rows:1,className:'!h-auto'})],
  columns: [{"name":"studentName","label":"Student Name"},{"name":"award","label":"Medal / Award"},{"name":"category","label":"Category"},{"name":"remarks","label":"Remarks"}],
};

