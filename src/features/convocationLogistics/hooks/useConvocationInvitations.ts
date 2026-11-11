import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/invitationsFormConfig';
import { service } from '../services/invitationsService';
import { validate } from '../validation/invitationsValidation';
export const usePage = () => useModulePage(definition, service, validate);

