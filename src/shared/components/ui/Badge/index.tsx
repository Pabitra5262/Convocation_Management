// src/components/ui/Badge/index.tsx
import React from 'react';
import type { BadgeProps, BadgeStyle, BadgeTone, StatusBadgeProps } from './badge.types';
import { baseBadgeStyle, badgeSizes, STATUS_MAP } from './badge.styles';

/** Maps the old variant names onto tone + fill. */
const resolve = (tone: BadgeTone | undefined, variant: BadgeProps['variant']): { tone: BadgeTone; fill: BadgeStyle } => {
  if (variant === 'primary') return { tone: tone ?? 'primary', fill: 'solid' };
  if (variant === 'secondary') return { tone: tone ?? 'neutral', fill: 'soft' };
  return { tone: tone ?? 'neutral', fill: variant ?? 'soft' };
};

/** Pill label (hims-ui-new Status/Badge). */
export const Badge: React.FC<Readonly<BadgeProps>> = ({
  children,
  tone,
  variant,
  size = 'md',
  dot = false,
  icon: Icon,
  isLoading = false,
  className = '',
  ...props
}) => {
  const r = resolve(tone, variant);
  return (
    <span
      className={`${baseBadgeStyle} ui-badge--${r.tone} ui-badge--${r.fill} ${badgeSizes[size]} ${className}`}
      {...props}
    >
      {isLoading && <span className="ui-btn__spinner !h-3 !w-3" role="status" aria-label="Loading" />}
      {dot && <span className="ui-badge__dot" aria-hidden />}
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};

/** Status pill with icon + text (Active, Pending, Suspended …). */
export const StatusBadge: React.FC<Readonly<StatusBadgeProps>> = ({ status, label, className }) => {
  const s = STATUS_MAP[status];
  return (
    <Badge tone={s.tone} icon={s.icon} className={className}>
      {label ?? s.label}
    </Badge>
  );
};

export type { BadgeProps, BadgeTone, BadgeStyle, Status, StatusBadgeProps } from './badge.types';

export default Badge;
