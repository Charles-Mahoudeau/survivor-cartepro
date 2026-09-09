'use client';

import { RiCheckLine, RiCloseLine } from '@remixicon/react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card } from '@/components/composites/card';
import { Button } from '@/components/ui/button';
import { ADMIN_CONTENT } from '@/content/admin';
import { MAX_DECISION_REASON_LENGTH } from '@/lib/api/schemas/backend/partner-application';
import type { ApplicationDecision } from '@/lib/api/schemas/backend/partner-application';

import { decideApplicationAction } from './actions/decide.action';

const REASON_ROWS = 4;

export function DecisionForm({ applicationId }: { applicationId: string }) {
  const [reason, setReason] = useState('');

  const decide = useAction(decideApplicationAction, {
    onSuccess: ({ input }) => {
      setReason('');
      toast.success(
        input.decision === 'approved'
          ? ADMIN_CONTENT.application.decision.approved
          : ADMIN_CONTENT.application.decision.refused,
      );
    },
    onError: ({ error }) =>
      toast.error(
        error.serverError ?? ADMIN_CONTENT.application.decision.reasonRequired,
      ),
  });

  function submit(decision: ApplicationDecision) {
    const trimmed = reason.trim();

    if (!trimmed) {
      toast.error(ADMIN_CONTENT.application.decision.reasonRequired);
      return;
    }

    decide.execute({ applicationId, decision, reason: trimmed });
  }

  return (
    <Card className="p-5">
      <h2 className="mb-1 font-medium">
        {ADMIN_CONTENT.application.decision.title}
      </h2>
      <p className="text-muted-foreground mb-3 text-sm">
        {ADMIN_CONTENT.application.decision.help}
      </p>

      <label
        htmlFor="decision-reason"
        className="mb-1 block text-xs font-medium"
      >
        {ADMIN_CONTENT.application.decision.reasonLabel}
      </label>
      <textarea
        id="decision-reason"
        name="reason"
        rows={REASON_ROWS}
        required
        maxLength={MAX_DECISION_REASON_LENGTH}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        disabled={decide.isPending}
        placeholder={ADMIN_CONTENT.application.decision.reasonPlaceholder}
        className="border-input bg-card focus-visible:ring-ring/30 w-full rounded-lg border px-3 py-2 text-sm focus-visible:ring-3 focus-visible:outline-none disabled:opacity-60"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => submit('approved')} disabled={decide.isPending}>
          <RiCheckLine aria-hidden className="size-4" />
          {decide.isPending
            ? ADMIN_CONTENT.application.decision.submitting
            : ADMIN_CONTENT.application.decision.approve}
        </Button>
        <Button
          variant="ghost"
          onClick={() => submit('refused')}
          disabled={decide.isPending}
        >
          <RiCloseLine aria-hidden className="size-4" />
          {ADMIN_CONTENT.application.decision.refuse}
        </Button>
      </div>
    </Card>
  );
}
