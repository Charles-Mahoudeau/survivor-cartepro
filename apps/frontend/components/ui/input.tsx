import * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'bg-muted h-11 w-full rounded-xl px-3.5 text-sm outline-none transition-colors',
        'placeholder:text-muted-foreground',
        'focus-visible:ring-ring/30 focus-visible:ring-3',
        'disabled:pointer-events-none disabled:opacity-50',
        'aria-[invalid=true]:ring-destructive/30 aria-[invalid=true]:ring-3',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
