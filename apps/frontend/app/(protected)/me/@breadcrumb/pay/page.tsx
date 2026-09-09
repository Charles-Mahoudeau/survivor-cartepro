import { LayoutBreadcrumb } from '@/components/composites/layout-breadcrumb';
import { ME_CONTENT } from '@/content/me';

import { ME_TRAIL_ROOT } from '../page';

export default function Page() {
  return (
    <LayoutBreadcrumb
      path={[ME_TRAIL_ROOT, { title: ME_CONTENT.pay.title, href: '/me/pay' }]}
    />
  );
}
