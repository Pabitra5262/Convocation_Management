import type { PageDefinition } from '@/features/convocationCommon/types';
import * as fields from '@/features/convocationCommon/form-config/fieldHelpers';
export const definition: PageDefinition = {
  key: "logistics",
  title: "Logistics & Seating",
  formTitle: "Seating Configuration",
  path: "/convocation/logistics",
  roles: ["admin","exam","coordinator","college","super"],
  writers: ["admin","exam","coordinator","super"],
  defaults: {"reservedSeats":0,"guestLimit":2,"mode":"Auto Alphabetical"},
  fields: ctx => [
fields.field('eventId','Convocation Event','select',4,{required:true,options:fields.eventOptions(ctx)}),
fields.field('totalSeats','Total Seats Available','number',2,{required:true,min:1}),
fields.field('reservedSeats','Reserved Seats (VIP / Officials)','number',3,{min:0}),
fields.field('guestLimit','Guest Seats per Student','number',3,{required:true,min:0}),
fields.field('mode','Student Seat Allocation Mode','select',4,{required:true,options:fields.options(['Auto by Program','Auto Alphabetical','Manual'])}),
fields.field('venueLayout','Venue Layout','file',4,{accept:'.pdf,.png,.jpg,.jpeg'}),
fields.field('stageSequence','Stage Sequence / VIP Notes','textarea',4,{rows:1,className:'!h-auto'})],
  columns: [{"name":"eventId","label":"Convocation Event"},{"name":"totalSeats","label":"Total Seats"},{"name":"reservedSeats","label":"Reserved Seats"},{"name":"guestLimit","label":"Guest Limit"},{"name":"mode","label":"Allocation Mode"}],
};

