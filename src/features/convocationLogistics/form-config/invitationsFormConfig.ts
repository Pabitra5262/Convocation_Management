import type { PageDefinition } from '@/features/convocationCommon/types';
export const definition: PageDefinition = {
  key: "invitations",
  title: "Invitations & Entry Passes",
  formTitle: "Invitation Details",
  path: "/convocation/invitations",
  roles: ["admin","exam","coordinator","college","super"],
  writers: [],
  readOnly: true,
  bulk: "invite",
  fields: () => [],
  columns: [{"name":"studentName","label":"Student Name"},{"name":"eventName","label":"Convocation Event"},{"name":"attendance","label":"Attendance Preference"},{"name":"seat","label":"Seat Number"},{"name":"guestSeats","label":"Guest Seats"},{"name":"generatedOn","label":"Generated On"}],
};

