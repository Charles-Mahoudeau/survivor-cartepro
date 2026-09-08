import { RiErrorWarningLine, RiInformationLine } from '@remixicon/react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export type AlertSeverity = 'error' | 'info' | 'warning';

const TONES: Record<AlertSeverity, string> = {
  error: 'bg-coral-light text-coral-dark',
  info: 'bg-muted text-muted-foreground',
  warning: 'bg-warning-light text-warning',
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
        'flex items-start gap-2 rounded-xl px-4 py-3 text-sm',
        TONES[severity],
        className,
      )}
    >
      <Icon aria-hidden className="mt-px size-4 shrink-0" />
      <div>
        {title ? <p className="font-medium">{title}</p> : null}
        <p>{description}</p>
      </div>
    </div>
  );
}
