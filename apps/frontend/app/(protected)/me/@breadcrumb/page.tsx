import { LayoutBreadcrumb } from '@/components/composites/layout-breadcrumb';
import { ME_CONTENT } from '@/content/me';

export const ME_TRAIL_ROOT = { title: ME_CONTENT.nav.wallet, href: '/me' };

export default function Page() {
  return <LayoutBreadcrumb path={[ME_TRAIL_ROOT]} />;
}
