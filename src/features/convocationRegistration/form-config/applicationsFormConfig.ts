import type { PageDefinition } from '@/features/convocationCommon/types';
import * as fields from '@/features/convocationCommon/form-config/fieldHelpers';
export const definition: PageDefinition = {
  key: "applications",
  title: "My Applications",
  formTitle: "Application Details",
  path: "/convocation/applications",
  roles: ["candidate","college","admin","exam","super"],
  writers: [],
  readOnly: true,
  fields: () => [],
  columns: fields.applicationColumns,
};

