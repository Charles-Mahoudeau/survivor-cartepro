import type { ComponentProps, ElementType } from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

const QUICK_ACCESS_CLASS =
  'inline-flex items-center gap-1.5 rounded-[var(--radius-md)] px-2.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50';

export function QuickAccessLink({
  icon: Icon,
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { icon: ElementType }) {
  return (
    <Link className={cn(QUICK_ACCESS_CLASS, className)} {...props}>
      <Icon aria-hidden className="size-4 shrink-0" />
      <span className="max-w-40 truncate">{children}</span>
    </Link>
  );
}

export function QuickAccessButton({
  icon: Icon,
  className,
  children,
  ...props
}: ComponentProps<'button'> & { icon: ElementType }) {
  return (
    <button
      type="button"
      className={cn(QUICK_ACCESS_CLASS, className)}
      {...props}
    >
      <Icon aria-hidden className="size-4 shrink-0" />
      <span>{children}</span>
    </button>
  );
}
