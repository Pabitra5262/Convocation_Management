import type { PageDefinition } from '@/features/convocationCommon/types';
import * as fields from '@/features/convocationCommon/form-config/fieldHelpers';
export const definition: PageDefinition = {
  key: "students",
  title: "Eligible Students",
  formTitle: "Add Student",
  path: "/convocation/students",
  roles: ["admin","exam","super","college"],
  writers: ["admin","exam","super"],
  defaults: {"eligible":true},
  fields: ctx => [
fields.field('name','Student Name','text',3,{required:true}),
fields.field('apaarId','APAAR ID','text',3,{required:true,maxLength:12}),
fields.field('enrolment','Enrolment / Roll No.','text',3,{required:true}),
fields.field('institutionId','Institution','select',3,{required:true,options:fields.institutionOptions(ctx)}),
fields.field('program','Program / Course','select',3,{required:true,options:fields.options(['Undergraduate','Postgraduate','PhD'])}),
fields.field('branch','Branch / Specialization','text',3,{required:true}),
fields.field('passingYear','Passing Year / Batch','number',2,{required:true,min:1950}),
fields.field('dob','Date of Birth','date',2,{required:true}),
fields.field('gender','Gender','select',2,{required:true,options:fields.options(['Female','Male','Other'])}),
fields.field('email','Email ID','email',3,{required:true}),
fields.field('mobile','Mobile Number','tel',3,{required:true,maxLength:10}),
fields.field('address','Permanent Address','textarea',6,{required:true,rows:1,className:'!h-auto'}),
fields.field('eligible','Academic Eligibility Confirmed','checkbox',3)],
  columns: [{"name":"name","label":"Student Name"},{"name":"apaarId","label":"APAAR ID"},{"name":"enrolment","label":"Enrolment No."},{"name":"institutionId","label":"Institution"},{"name":"program","label":"Program"},{"name":"branch","label":"Branch"},{"name":"passingYear","label":"Passing Year"}],
};

