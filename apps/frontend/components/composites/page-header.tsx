import type { ReactNode } from 'react';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4 md:mb-8">
      <div>
        <h1 className="font-display text-xl font-semibold leading-tight text-[color:var(--foreground)] md:text-2xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 font-serif text-sm text-[color:var(--muted-foreground)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
