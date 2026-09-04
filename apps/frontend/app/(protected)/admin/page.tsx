import { EspacePlaceholder } from '@/components/composites/espace-placeholder';
import { StartDsfrOnHydration } from '@/lib/dsfr';

export default function Page() {
  return (
    <>
      <StartDsfrOnHydration />
      <EspacePlaceholder titre="Administration" home="/admin" />
    </>
  );
}
