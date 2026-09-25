/**
 * ANL Design System — className helper
 *
 * Tiny utility to conditionally join Tailwind class strings.
 * Keeps atomic components readable without pulling in a dependency.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export default cn;
