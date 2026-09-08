import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

/** A plain white surface: no outline, no shadow, no tint. */
export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn('bg-card rounded-2xl', className)}>{children}</div>;
}
