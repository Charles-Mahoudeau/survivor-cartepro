import { RiDownloadLine } from '@remixicon/react';
import type { Metadata } from 'next';

import { Card } from '@/components/composites/card';
import { Button } from '@/components/ui/button';
import { ADMIN_CONTENT } from '@/content/admin';
import { SITE_CONTENT } from '@/content/site';

export const metadata: Metadata = {
  title: `${ADMIN_CONTENT.payments.title} — ${SITE_CONTENT.title}`,
};

const EXPORT_ROUTE = '/admin/payments/export';

export default function Page() {
  const { payments } = ADMIN_CONTENT;

  return (
    <section className="col-span-12 lg:col-span-8">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        {payments.title}
      </h1>
      <p className="text-muted-foreground mb-5 max-w-2xl text-sm">
        {payments.subtitle}
      </p>

      <Card className="p-5">
        <h2 className="mb-1 font-medium">{payments.export.title}</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          {payments.export.body}
        </p>
        <Button asChild>
          <a href={EXPORT_ROUTE} download>
            <RiDownloadLine aria-hidden className="size-4" />
            {payments.export.download}
          </a>
        </Button>
      </Card>
    </section>
  );
}
