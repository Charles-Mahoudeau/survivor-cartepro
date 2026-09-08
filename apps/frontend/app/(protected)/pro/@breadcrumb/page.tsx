import { LayoutBreadcrumb } from '@/components/composites/layout-breadcrumb';

export default function Page() {
  return (
    <LayoutBreadcrumb path={[{ title: 'Espace partenaire', href: '/pro' }]} />
  );
}
