import { SITE_CONTENT } from '@/content/site';

/**
 * Carries the disclaimer required by the cabinet on every page, error pages
 * included, so it can never be reached through a route that omits it.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto px-4 py-6">
      <p className="text-muted-foreground mx-auto w-full max-w-6xl text-xs">
        {SITE_CONTENT.disclaimer}
      </p>
    </footer>
  );
}
