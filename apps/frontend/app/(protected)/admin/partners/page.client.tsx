'use client';

import { RiArrowRightLine } from '@remixicon/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { Card } from '@/components/composites/card';
import { DateTexte } from '@/components/composites/date-texte';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ADMIN_CONTENT } from '@/content/admin';
import type { ApplicationPage } from '@/lib/api/schemas/backend/partner-application';

import { REVIEWABLE_STATUSES, type ReviewableStatus } from './statuses';

interface ApplicationsClientProps {
  page: ApplicationPage;
  status: ReviewableStatus;
}

export function ApplicationsClient({ page, status }: ApplicationsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function selectStatus(next: ReviewableStatus) {
    const params = new URLSearchParams(searchParams);
    params.set('status', next);
    router.push(`/admin/partners?${params.toString()}`);
  }

  return (
    <>
      <div
        className="mb-4 flex flex-wrap gap-2"
        role="group"
        aria-label={ADMIN_CONTENT.applications.filter.label}
      >
        {REVIEWABLE_STATUSES.map((candidate) => (
          <Chip
            key={candidate}
            pressed={candidate === status}
            onClick={() => selectStatus(candidate)}
          >
            {ADMIN_CONTENT.applications.filter[candidate]}
          </Chip>
        ))}
      </div>

      {page.items.length === 0 ? (
        <Card className="p-6">
          <p className="text-muted-foreground text-sm">
            {ADMIN_CONTENT.applications.empty}
          </p>
        </Card>
      ) : (
        <Card className="divide-border divide-y p-0">
          {page.items.map((application) => (
            <article
              key={application.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{application.tradeName}</p>
                <p className="text-muted-foreground truncate text-xs">
                  {application.legalName} · {ADMIN_CONTENT.applications.siren}{' '}
                  {application.siren} · {application.city}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {ADMIN_CONTENT.applications.filedOn}{' '}
                  <DateTexte iso={application.createdAt} format="jour" />
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="bg-muted text-muted-foreground inline-flex h-8 items-center rounded-full px-3 text-xs font-medium">
                  {ADMIN_CONTENT.applications.status[application.status]}
                </span>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/partners/${application.id}`}>
                    {application.status === 'pending'
                      ? ADMIN_CONTENT.applications.review
                      : ADMIN_CONTENT.applications.viewDecision}
                    <RiArrowRightLine aria-hidden className="size-4" />
                  </Link>
                </Button>
              </div>
            </article>
          ))}
        </Card>
      )}
    </>
  );
}
