import { SITE_CONTENT } from '@/content/site';

import { cn } from '@/lib/utils';

/** The product name set in type: no emblem, no crest, no institutional block. */
export function Wordmark({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col select-none', className)}>
      <span
        className={cn(
          'font-display font-semibold tracking-tight',
          compact ? 'text-base leading-none' : 'text-xl leading-none',
        )}
      >
        {SITE_CONTENT.brand}
      </span>
      {compact ? null : (
        <span className="text-muted-foreground mt-1 text-[10px] tracking-widest uppercase">
          {SITE_CONTENT.serviceTagline}
        </span>
      )}
    </div>
  );
}
