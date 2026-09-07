import { RiErrorWarningLine, RiInformationLine } from '@remixicon/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type AlertSeverity = 'error' | 'info' | 'warning';

const TONES: Record<AlertSeverity, string> = {
  error: 'border-destructive/40 bg-coral-light text-coral-dark',
  info: 'border-primary/30 bg-secondary text-secondary-foreground',
  warning: 'border-warning-border bg-warning-light text-warning',
};

const ICONS: Record<AlertSeverity, typeof RiInformationLine> = {
  error: RiErrorWarningLine,
  info: RiInformationLine,
  warning: RiErrorWarningLine,
};

export function Alert({
  severity = 'info',
  title,
  description,
  className,
}: {
  severity?: AlertSeverity;
  title?: ReactNode;
  description: ReactNode;
  className?: string;
}) {
  const Icon = ICONS[severity];

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm',
        TONES[severity],
        className,
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-4 shrink-0" />
      <div>
        {title ? <p className="font-display font-semibold">{title}</p> : null}
        <p className={cn(title && 'mt-0.5')}>{description}</p>
      </div>
    </div>
  );
}
