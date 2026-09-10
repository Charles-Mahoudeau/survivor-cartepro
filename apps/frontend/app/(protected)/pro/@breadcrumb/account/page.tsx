import { LayoutBreadcrumb } from '@/components/composites/layout-breadcrumb';
import { PRO_CONTENT } from '@/content/pro';

import { PRO_TRAIL_ROOT } from '../page';

export default function Page() {
  return (
    <LayoutBreadcrumb
      path={[PRO_TRAIL_ROOT, { title: PRO_CONTENT.account.trail }]}
    />
  );
}
