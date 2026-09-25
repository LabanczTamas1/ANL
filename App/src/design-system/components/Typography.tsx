import React from 'react';
import { cn } from './cn';

export type HeadingLevel = 1 | 2 | 3 | 4;

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
  /** Render a different heading tag than the visual level implies. */
  as?: React.ElementType;
}

const headingStyles: Record<HeadingLevel, string> = {
  1: 'text-3xl font-bold',
  2: 'text-2xl font-semibold',
  3: 'text-xl font-semibold',
  4: 'text-lg font-medium',
};

/**
 * Atomic heading. Colors adapt to light/dark via content tokens.
 */
export const Heading: React.FC<HeadingProps> = ({ level = 2, as, className, children, ...rest }) => {
  const Tag = (as ?? (`h${level}` as React.ElementType)) as React.ElementType;
  return (
    <Tag
      className={cn('text-content dark:text-content-inverse', headingStyles[level], className)}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export type TextTone = 'default' | 'muted' | 'subtle';
export type TextSize = 'xs' | 'sm' | 'base' | 'lg';

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  tone?: TextTone;
  size?: TextSize;
  as?: React.ElementType;
}

const textToneStyles: Record<TextTone, string> = {
  default: 'text-content dark:text-content-inverse',
  subtle: 'text-content-subtle dark:text-content-subtle-inverse',
  muted: 'text-content-muted',
};

const textSizeStyles: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
};

/**
 * Atomic body text.
 */
export const Text: React.FC<TextProps> = ({
  tone = 'default',
  size = 'base',
  as: Tag = 'p',
  className,
  children,
  ...rest
}) => (
  <Tag className={cn(textToneStyles[tone], textSizeStyles[size], className)} {...rest}>
    {children}
  </Tag>
);

export default Heading;
