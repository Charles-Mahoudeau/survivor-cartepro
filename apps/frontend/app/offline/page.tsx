import type { Metadata } from 'next';

import { AuthShell } from '@/components/composites/auth-shell';
import { OfflineView } from '@/components/views/offline';
import { SITE_CONTENT } from '@/content/site';

export const metadata: Metadata = {
  title: SITE_CONTENT.offline.pageTitle,
};

export default function Page() {
  const { offline } = SITE_CONTENT;

  return (
    <AuthShell titre={offline.title} sousTitre={offline.subtitle}>
      <OfflineView />
    </AuthShell>
  );
}
