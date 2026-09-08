import {
  LayoutBreadcrumb,
  type LayoutBreadcrumbPath,
} from '@/components/composites/layout-breadcrumb';
import { ME_CONTENT } from '@/content/me';

export const ME_BREADCRUMB_ROOT: LayoutBreadcrumbPath = {
  title: ME_CONTENT.nav.wallet,
  href: '/me',
};

export default function WalletBreadcrumb() {
  return <LayoutBreadcrumb path={[ME_BREADCRUMB_ROOT]} />;
}
