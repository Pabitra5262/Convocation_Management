import type { PageDefinition } from '@/features/convocationCommon/types';
import * as fields from '@/features/convocationCommon/form-config/fieldHelpers';
export const definition: PageDefinition = {
  key: "communications",
  title: "Communication Management",
  formTitle: "Compose Communication",
  path: "/convocation/communications",
  roles: ["admin","coordinator","hed","super"],
  writers: ["admin","coordinator","hed","super"],
  defaults: {"eventId":"all","group":"All Registered","channels":["Email"]},
  fields: ctx => [
fields.field('eventId','Convocation Event','select',4,{required:true,options:[{value:'all',label:'All Events'},...fields.eventOptions(ctx)]}),
fields.field('group','Recipient Group','select',4,{required:true,options:fields.options(['All Registered','In-person','Virtual','In-Absentia','Specific Institution','Custom Selection','Pending Verification'])}),
fields.field('channels','Channel','multiselect',4,{required:true,options:fields.options(['Email','SMS','In-app'])}),
...(ctx.values.group==='Specific Institution'?[fields.field('institutionId','Institution','select',4,{required:true,options:fields.institutionOptions(ctx)})]:[]),
...(ctx.values.group==='Custom Selection'?[fields.field('recipientIds','Recipients','multiselect',12,{required:true,options:ctx.data.applications.filter(a=>ctx.values.eventId==='all'||a.values.eventId===ctx.values.eventId).map(a=>({value:a.id,label:ctx.data.students.find(s=>s.id===a.values.studentId)?.values.name??a.id}))})]:[]),
fields.field('subject','Subject / Title','text',6,{maxLength:200}),
fields.field('scheduledAt','Schedule Send (Optional)','datetime-local',3),
fields.field('attachment','Attachment','file',3,{accept:'.pdf,.png,.jpg,.jpeg',helpText:'Maximum 5 MB'}),
fields.field('body','Message Body','textarea',12,{required:true,rows:1,className:'!h-auto',helpText:'Merge fields: {{Student Name}}, {{Event Date}}, {{Seat No.}}, {{Registration ID}}'})],
  columns: [{"name":"eventId","label":"Convocation Event"},{"name":"group","label":"Recipient Group"},{"name":"channels","label":"Channels"},{"name":"subject","label":"Subject"},{"name":"recipientCount","label":"Recipients"},{"name":"scheduledAt","label":"Scheduled For"}],
};


