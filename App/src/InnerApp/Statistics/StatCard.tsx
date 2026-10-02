import React from 'react';
import { Card, Text, cn } from '@design-system/components';

export type StatTone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';

export interface StatCardProps {
  label: string;
  value: number | string;
  tone?: StatTone;
  icon?: React.ReactNode;
}

const valueToneStyles: Record<StatTone, string> = {
  brand: 'text-brand dark:text-brand-focus',
  success: 'text-status-success',
  warning: 'text-status-warning',
  danger: 'text-status-error',
  neutral: 'text-content dark:text-content-inverse',
};

const iconToneStyles: Record<StatTone, string> = {
  brand: 'bg-brand-muted text-brand dark:text-brand-focus',
  success: 'bg-status-success/15 text-status-success',
  warning: 'bg-status-warning/20 text-status-warning',
  danger: 'bg-status-error/15 text-status-error',
  neutral: 'bg-black/[0.06] text-content-subtle dark:bg-white/10 dark:text-content-subtle-inverse',
};

/**
 * Compact summary metric card, composed from design-system primitives.
 */
const StatCard: React.FC<StatCardProps> = ({ label, value, tone = 'neutral', icon }) => (
  <Card padding="md" className="transition-shadow hover:shadow-lg">
    <div className="flex items-center gap-4">
      {icon && (
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
            iconToneStyles[tone],
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col">
        <Text tone="subtle" size="sm">
          {label}
        </Text>
        <span className={cn('text-3xl font-bold', valueToneStyles[tone])}>{value}</span>
      </div>
    </div>
  </Card>
);

export default StatCard;
