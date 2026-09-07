import type { ComponentProps } from 'react';

import { cn } from '@/lib/utils';

/** A filter pill: pressed carries the selection, so it needs `aria-pressed`. */
export function Chip({
  pressed = false,
  className,
  ...props
}: ComponentProps<'button'> & { pressed?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      className={cn(
        'inline-flex h-8 items-center rounded-full border px-3 text-xs font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30',
        pressed
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:bg-muted',
        className,
      )}
      {...props}
    />
  );
}
