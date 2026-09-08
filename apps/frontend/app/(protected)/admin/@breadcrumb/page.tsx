import { LayoutBreadcrumb } from '@/components/composites/layout-breadcrumb';

export default function AdminBreadcrumb() {
  return (
    <LayoutBreadcrumb path={[{ title: 'Administration', href: '/admin' }]} />
  );
}
