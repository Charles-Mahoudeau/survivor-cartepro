'use client';

import { RiSendPlaneLine } from '@remixicon/react';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

import { Card } from '@/components/composites/card';
import { Button } from '@/components/ui/button';
import { ADMIN_CONTENT } from '@/content/admin';

import { applyAllocationAction } from './actions/apply-allocation.action';

export function ApplyForm({ allocationId }: { allocationId: string }) {
  const apply = useAction(applyAllocationAction, {
    onSuccess: () => toast.success(ADMIN_CONTENT.allocation.appliedToast),
    onError: ({ error }) =>
      toast.error(error.serverError ?? ADMIN_CONTENT.error.body),
  });

  return (
    <Card className="p-5">
      <p className="text-muted-foreground mb-4 max-w-xl text-sm">
        {ADMIN_CONTENT.allocation.applyHelp}
      </p>
      <Button
        onClick={() => apply.execute({ allocationId })}
        disabled={apply.isPending}
      >
        <RiSendPlaneLine aria-hidden className="size-4" />
        {apply.isPending
          ? ADMIN_CONTENT.allocation.applying
          : ADMIN_CONTENT.allocation.apply}
      </Button>
    </Card>
  );
}
