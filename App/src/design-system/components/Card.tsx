import React from 'react';
import { cn } from './cn';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  as?: React.ElementType;
}

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Atomic surface container. Adapts to light/dark via design-system surface tokens.
 */
export const Card: React.FC<CardProps> = ({
  padding = 'md',
  as: Tag = 'div',
  className,
  children,
  ...rest
}) => (
  <Tag
    className={cn(
      'rounded-lg border border-line dark:border-line-dark bg-surface-light dark:bg-surface-elevated shadow-card',
      paddingStyles[padding],
      className,
    )}
    {...rest}
  >
    {children}
  </Tag>
);

export default Card;
