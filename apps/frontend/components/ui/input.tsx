import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'h-10 w-full rounded-[var(--radius-md)] border border-border bg-card px-3 text-sm text-foreground outline-none transition-colors',
        'placeholder:text-muted-foreground',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
        'disabled:pointer-events-none disabled:opacity-50',
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-3 aria-[invalid=true]:ring-destructive/20',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
