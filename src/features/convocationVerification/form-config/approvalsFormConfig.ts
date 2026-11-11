import type { PageDefinition } from '@/features/convocationCommon/types';
import * as fields from '@/features/convocationCommon/form-config/fieldHelpers';
export const definition: PageDefinition = {
  key: "approvals",
  title: "Approval & Award Lists",
  formTitle: "Application Details",
  path: "/convocation/approvals",
  roles: ["exam","faculty","authority","super"],
  writers: [],
  readOnly: true,
  fields: () => [],
  columns: fields.applicationColumns,
};

