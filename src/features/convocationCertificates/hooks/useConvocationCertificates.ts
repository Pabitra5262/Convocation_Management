import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/certificatesFormConfig';
import { service } from '../services/certificatesService';
import { validate } from '../validation/certificatesValidation';
import { useEffect } from 'react';
import { ensureCertificateDemoData } from '../services/certificateDemoData';
export const usePage = () => {
  const controller = useModulePage(definition, service, validate);
  useEffect(ensureCertificateDemoData, []);
  return controller;
};

