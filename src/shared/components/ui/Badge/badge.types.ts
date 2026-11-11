// src/components/ui/Badge/badge.types.ts
import type { ReactNode, HTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

export type BadgeTone = 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeStyle = 'soft' | 'solid' | 'outline';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  /** Colour. */
  tone?: BadgeTone;
  /**
   * Fill: soft (default) · solid · outline.
   * The old values still work: "primary" = solid primary, "secondary" = soft neutral.
   */
  variant?: BadgeStyle | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  /** Small coloured dot before the text. */
  dot?: boolean;
  icon?: LucideIcon;
  isLoading?: boolean;
  className?: string;
}

export type Status = 'active' | 'inactive' | 'pending' | 'suspended' | 'error' | 'warning' | 'info' | 'success';

export interface StatusBadgeProps {
  status: Status;
  label?: string;
  className?: string;
}
