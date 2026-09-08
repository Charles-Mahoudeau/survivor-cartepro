'use client';

import { RiAccountCircleLine } from '@remixicon/react';
import Link from 'next/link';

import { Wordmark } from '@/components/composites/wordmark';
import { Button } from '@/components/ui/button';
import { SITE_CONTENT } from '@/content/site';

/** The chrome of the public pages, where no space and no sidebar exist yet. */
export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-40 border-b">
      <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3">
        <Link
          href="/"
          title={SITE_CONTENT.homeTitle}
          className="mr-auto rounded-lg focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none"
        >
          <Wordmark />
        </Link>
        <Button asChild variant="ghost" size="lg">
          <Link href="/login">
            <RiAccountCircleLine data-icon="inline-start" />
            {SITE_CONTENT.signIn}
          </Link>
        </Button>
      </div>
    </header>
  );
}
