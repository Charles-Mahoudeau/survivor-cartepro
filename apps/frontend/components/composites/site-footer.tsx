import { SITE_CONTENT } from '@/content/site';

/**
 * Carries the disclaimer required by the cabinet on every page, error pages
 * included, so it can never be reached through a route that omits it. It sits
 * at the foot of the page, on the left gutter, out of the reading path.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto px-4 py-6 lg:px-6">
      <p className="text-muted-foreground text-xs">{SITE_CONTENT.disclaimer}</p>
    </footer>
  );
}
