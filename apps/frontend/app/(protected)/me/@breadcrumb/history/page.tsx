import { LayoutBreadcrumb } from '@/components/composites/layout-breadcrumb';
import { ME_CONTENT } from '@/content/me';

import { ME_BREADCRUMB_ROOT } from '../page';

export default function HistoryBreadcrumb() {
  return (
    <LayoutBreadcrumb
      path={[
        ME_BREADCRUMB_ROOT,
        { title: ME_CONTENT.history.title, href: '/me/history' },
      ]}
    />
  );
}
