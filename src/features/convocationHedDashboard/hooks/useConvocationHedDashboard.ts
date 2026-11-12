import { useModulePage } from '@/features/convocationCommon/hooks/useModulePage';
import { definition } from '../form-config/hedFormConfig';
import { service } from '../services/hedService';
import { validate } from '../validation/hedValidation';
import { useEffect } from 'react';
import { ensureHedDemoData } from '../services/hedDemoData';
export const usePage = () => {
  const controller = useModulePage(definition, service, validate);
  useEffect(ensureHedDemoData, []);
  return controller;
};

