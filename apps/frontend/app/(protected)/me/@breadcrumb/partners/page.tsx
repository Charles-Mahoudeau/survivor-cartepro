import { LayoutBreadcrumb } from '@/components/composites/layout-breadcrumb';
import { ME_CONTENT } from '@/content/me';

import { ME_BREADCRUMB_ROOT } from '../page';

export default function PartnersBreadcrumb() {
  return (
    <LayoutBreadcrumb
      path={[
        ME_BREADCRUMB_ROOT,
        { title: ME_CONTENT.partners.title, href: '/me/partners' },
      ]}
    />
  );
}
