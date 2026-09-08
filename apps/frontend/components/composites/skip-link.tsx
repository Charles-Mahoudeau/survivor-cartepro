import { SITE_CONTENT } from '@/content/site';

/** Visible only once focused, so a keyboard user can jump past the header. */
export function SkipLink() {
  return (
    <a
      href="#contenu"
      className="sr-only rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm text-primary-foreground focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50"
    >
      {SITE_CONTENT.skipToContent}
    </a>
  );
}
