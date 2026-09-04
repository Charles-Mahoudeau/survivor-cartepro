import { Card } from '@/components/composites/card';
import type { Partner } from '@/lib/api/schemas/backend/partner';

export function CartePartenaire({ partner }: { partner: Partner }) {
  const category = partner.categories[0];

  return (
    <Card className="p-4 transition-colors hover:border-[color:var(--primary)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-[color:var(--secondary)] font-display text-sm font-bold text-[color:var(--primary)]"
            aria-hidden="true"
          >
            {partner.tradeName.charAt(0)}
          </div>
          <div>
            <div className="font-display text-sm font-semibold text-[color:var(--foreground)]">
              {partner.tradeName}
            </div>
            <div className="mt-0.5 font-serif text-xs text-[color:var(--muted-foreground)]">
              {partner.addressLine}, {partner.postalCode} {partner.city}
            </div>
          </div>
        </div>
        {category ? (
          <span className="shrink-0 rounded-full bg-[color:var(--muted)] px-2 py-0.5 font-display text-xs text-[color:var(--muted-foreground)]">
            {category.displayName}
          </span>
        ) : null}
      </div>
    </Card>
  );
}
