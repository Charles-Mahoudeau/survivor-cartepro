import { Card } from '@codegouvfr/react-dsfr/Card';
import { Tag } from '@codegouvfr/react-dsfr/Tag';

import type { Partner } from '@/lib/api/schemas/backend/partner';

export function CartePartenaire({ partner }: { partner: Partner }) {
  const category = partner.categories[0];

  return (
    <Card
      size="small"
      border
      title={partner.tradeName}
      titleAs="h3"
      desc={`${partner.addressLine}, ${partner.postalCode} ${partner.city}`}
      start={
        category ? (
          <ul className="fr-tags-group">
            <li>
              <Tag small>{category.displayName}</Tag>
            </li>
          </ul>
        ) : undefined
      }
    />
  );
}
