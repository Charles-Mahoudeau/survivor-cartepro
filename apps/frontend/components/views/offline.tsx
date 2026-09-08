import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { PWA_START_URL } from '@/constants/pwa';
import { SITE_CONTENT } from '@/content/site';

/**
 * Served by the worker for any navigation that cannot reach the network, so it
 * says nothing about the page that was asked for. Reads no data and no session,
 * which is what lets it prerender and be precached. The action is a link rather
 * than a handler: the page stays usable even when its hydration chunks are not.
 */
export function OfflineView() {
  const { offline } = SITE_CONTENT;

  return (
    <div>
      <Alert
        severity="info"
        description={offline.description}
        className="mb-6"
      />
      <Button asChild variant="outline" size="lg">
        <a href={PWA_START_URL}>{offline.retry}</a>
      </Button>
    </div>
  );
}
