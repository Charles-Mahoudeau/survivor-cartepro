import type { Partner } from '@/lib/api/schemas/backend/partner';

export function CartePartenaire({ partner }: { partner: Partner }) {
  const category = partner.categories[0];

  return (
    <li className="flex items-baseline justify-between gap-4 px-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{partner.tradeName}</p>
        <p className="text-muted-foreground truncate text-xs">
          {partner.addressLine}, {partner.postalCode} {partner.city}
        </p>
      </div>
      {category ? (
        <span className="text-muted-foreground shrink-0 text-xs">
          {category.displayName}
        </span>
      ) : null}
    </li>
  );
}
