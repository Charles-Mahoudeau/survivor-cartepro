import { Card } from '@/components/composites/card';
import type { Partner } from '@/lib/api/schemas/backend/partner';

export function CartePartenaire({ partner }: { partner: Partner }) {
  const category = partner.categories[0];

  return (
    <Card className="p-4">
      <h3 className="font-display text-sm font-semibold text-[color:var(--foreground)]">
        {partner.tradeName}
      </h3>
      <p className="mt-0.5 text-xs text-[color:var(--muted-foreground)]">
        {partner.addressLine}, {partner.postalCode} {partner.city}
      </p>
      {category ? (
        <p className="mt-2">
          <span className="inline-flex items-center rounded-full bg-[color:var(--secondary)] px-2.5 py-0.5 text-xs font-medium text-[color:var(--secondary-foreground)]">
            {category.displayName}
          </span>
        </p>
      ) : null}
    </Card>
  );
}
