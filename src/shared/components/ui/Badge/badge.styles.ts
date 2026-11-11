// src/components/ui/Badge/badge.styles.ts
/* Colours: src/shared/styles/components.css (.ui-badge--{tone}.ui-badge--{style}) */
import { AlertTriangle, CheckCircle2, Clock, Info, Minus, PauseCircle, XCircle, type LucideIcon } from 'lucide-react';
import type { BadgeTone, Status } from './badge.types';

export const baseBadgeStyle = 'ui-badge';

export const badgeSizes = {
  sm: 'ui-badge--sm',
  md: '',
  lg: 'ui-badge--lg',
};

/** Status → tone + icon, so a state never relies on colour alone. */
export const STATUS_MAP: Record<Status, { tone: BadgeTone; icon: LucideIcon; label: string }> = {
  active: { tone: 'success', icon: CheckCircle2, label: 'Active' },
  success: { tone: 'success', icon: CheckCircle2, label: 'Success' },
  inactive: { tone: 'neutral', icon: Minus, label: 'Inactive' },
  pending: { tone: 'warning', icon: Clock, label: 'Pending' },
  warning: { tone: 'warning', icon: AlertTriangle, label: 'Warning' },
  suspended: { tone: 'danger', icon: PauseCircle, label: 'Suspended' },
  error: { tone: 'danger', icon: XCircle, label: 'Error' },
  info: { tone: 'info', icon: Info, label: 'Info' },
};
