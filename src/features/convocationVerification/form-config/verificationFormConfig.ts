import type { PageDefinition } from '@/features/convocationCommon/types';
import * as fields from '@/features/convocationCommon/form-config/fieldHelpers';
export const definition: PageDefinition = {
  key: "verification",
  title: "Application Verification",
  formTitle: "Application Details",
  path: "/convocation/verification",
  roles: ["exam","faculty","super"],
  writers: [],
  readOnly: true,
  fields: () => [],
  columns: fields.applicationColumns,
};

