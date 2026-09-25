import React from 'react';
import { cn } from './cn';

/**
 * Atomic table primitives. Compose them to build consistent data tables:
 *
 *   <TableContainer>
 *     <Table>
 *       <Thead><Tr><Th>Name</Th></Tr></Thead>
 *       <Tbody><Tr><Td>Ada</Td></Tr></Tbody>
 *     </Table>
 *   </TableContainer>
 */
export const TableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...rest
}) => (
  <div
    className={cn(
      'overflow-x-auto rounded-lg border border-line dark:border-line-dark',
      className,
    )}
    {...rest}
  >
    {children}
  </div>
);

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({
  className,
  children,
  ...rest
}) => (
  <table className={cn('min-w-full text-sm', className)} {...rest}>
    {children}
  </table>
);

export const Thead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...rest
}) => (
  <thead className={cn('bg-black/[0.03] dark:bg-white/5', className)} {...rest}>
    {children}
  </thead>
);

export const Tbody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({
  className,
  children,
  ...rest
}) => (
  <tbody
    className={cn('divide-y divide-line/70 dark:divide-line-dark/70', className)}
    {...rest}
  >
    {children}
  </tbody>
);

export interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hoverable?: boolean;
}

export const Tr: React.FC<TrProps> = ({ hoverable = false, className, children, ...rest }) => (
  <tr
    className={cn(
      'transition-colors',
      hoverable && 'hover:bg-black/[0.03] dark:hover:bg-white/5',
      className,
    )}
    {...rest}
  >
    {children}
  </tr>
);

export const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...rest
}) => (
  <th
    className={cn(
      'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-content-subtle dark:text-content-subtle-inverse',
      className,
    )}
    {...rest}
  >
    {children}
  </th>
);

export const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({
  className,
  children,
  ...rest
}) => (
  <td className={cn('px-4 py-3 text-content dark:text-content-inverse', className)} {...rest}>
    {children}
  </td>
);
