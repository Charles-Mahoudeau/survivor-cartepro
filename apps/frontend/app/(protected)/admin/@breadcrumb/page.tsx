import { LayoutBreadcrumb } from '@/components/composites/layout-breadcrumb';
import { ADMIN_CONTENT } from '@/content/admin';

export const ADMIN_TRAIL_ROOT = {
  title: ADMIN_CONTENT.roleLabel,
  href: '/admin',
} as const;

export default function Page() {
  return <LayoutBreadcrumb path={[ADMIN_TRAIL_ROOT]} />;
}
