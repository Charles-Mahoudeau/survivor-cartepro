import { SITE_CONTENT } from '@/content/site';

/**
 * Carries the disclaimer required by the cabinet on every page, error pages
 * included, so it can never be reached through a route that omits it.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        <p className="font-display text-sm font-bold tracking-tight text-primary">
          {SITE_CONTENT.brand}
        </p>
        <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
          {SITE_CONTENT.footerDescription}
        </p>
        <p className="mt-3 border-t border-border pt-3 text-xs font-medium text-foreground">
          {SITE_CONTENT.disclaimer}
        </p>
      </div>
    </footer>
  );
}
