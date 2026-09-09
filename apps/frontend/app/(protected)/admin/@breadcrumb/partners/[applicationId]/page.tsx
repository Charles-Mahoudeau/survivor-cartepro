import { LayoutBreadcrumb } from '@/components/composites/layout-breadcrumb';
import { ADMIN_CONTENT } from '@/content/admin';

import { ADMIN_TRAIL_ROOT } from '../../page';

export default function Page() {
  return (
    <LayoutBreadcrumb
      path={[
        ADMIN_TRAIL_ROOT,
        {
          title: ADMIN_CONTENT.applications.title,
          href: '/admin/partners',
        },
        { title: ADMIN_CONTENT.application.trail },
      ]}
    />
  );
}
