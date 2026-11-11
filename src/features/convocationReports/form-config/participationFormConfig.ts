import type { PageDefinition } from '@/features/convocationCommon/types';
export const definition: PageDefinition = {
  key: "participation",
  title: "My Participation",
  formTitle: "Participation Details",
  path: "/convocation/participation",
  roles: ["candidate"],
  writers: [],
  readOnly: true,
  fields: () => [],
  columns: [{"name":"eventName","label":"Convocation Event"},{"name":"applicationStatus","label":"Application Status"},{"name":"attendance","label":"Attendance Preference"},{"name":"seat","label":"Seat Number"},{"name":"invitationStatus","label":"Invitation Status"},{"name":"certificateStatus","label":"Certificate Status"}],
};

