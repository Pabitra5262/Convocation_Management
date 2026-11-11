export type { RecordRow, Values, PageContext } from '@/features/convocationCommon/types';
import type { Values } from '@/features/convocationCommon/types';

export interface StoredRegistrationFile { name: string; type: string; size: number; data?: string }
export interface RegistrationFormValues extends Values {
  eventId?: string;
  attendance?: string;
  guests?: number | string;
  email?: string;
  mobile?: string;
  address?: string;
  declaration?: boolean;
  photo?: File | StoredRegistrationFile | string | null;
  supportingDocument?: File | StoredRegistrationFile | string | null;
}

