import Link from 'next/link';

import {
  ACCESSIBILITE_PATH,
  MENTION_CONFORMITE,
} from '@/content/accessibilite';

/**
 * The footer every page carries. The RGAA requires the conformity mention on
 * the home page and a link to the accessibility page reachable from any page;
 * one footer on every shell is the cheapest way to satisfy both.
 */
export function PiedDePage() {
  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--card)] px-6 py-4">
      <nav aria-label="Informations légales">
        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <li>
            <Link
              href={ACCESSIBILITE_PATH}
              className="font-display text-xs text-[color:var(--primary)] underline underline-offset-2 hover:no-underline"
            >
              {MENTION_CONFORMITE}
            </Link>
          </li>
          <li className="font-display text-xs text-[color:var(--muted-foreground)]">
            Ministère du Job et Bonheur · JEB/DNI/2026-002
          </li>
        </ul>
      </nav>
    </footer>
  );
}
