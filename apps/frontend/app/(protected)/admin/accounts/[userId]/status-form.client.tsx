'use client';

import {
  RiLockLine,
  RiLockUnlockLine,
  RiProhibitedLine,
} from '@remixicon/react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { toast } from 'sonner';

import { Card } from '@/components/composites/card';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { ADMIN_CONTENT } from '@/content/admin';
import {
  type AccountStatusChange,
  MAX_ACCOUNT_REASON_LENGTH,
  SUSPENSION_DAYS,
  type SuspensionDays,
} from '@/lib/api/schemas/backend/account';

import type { AccountStatus } from '../status';
import { changeAccountStatusAction } from './actions/change-status.action';

type Measure = 'suspend' | 'close';

const REASON_ROWS = 3;
const DEFAULT_SUSPENSION_DAYS: SuspensionDays = 30;

const { change, reactivate } = ADMIN_CONTENT.account;

const DONE: Record<AccountStatusChange['action'], string> = {
  suspend: change.suspended,
  close: change.closed,
  reactivate: reactivate.done,
};

/** Suspends or closes an active account with a reason, or reactivates one that is not. */
export function StatusForm({
  userId,
  status,
}: {
  userId: string;
  status: AccountStatus;
}) {
  const [measure, setMeasure] = useState<Measure>('suspend');
  const [days, setDays] = useState<SuspensionDays>(DEFAULT_SUSPENSION_DAYS);
  const [reason, setReason] = useState('');

  const action = useAction(changeAccountStatusAction, {
    onSuccess: ({ input }) => {
      setReason('');
      toast.success(DONE[input.action]);
    },
    onError: ({ error }) => toast.error(error.serverError ?? change.failed),
  });

  if (status !== 'active') {
    return (
      <Card className="p-5">
        <h2 className="mb-1 font-medium">{reactivate.title}</h2>
        <p className="text-muted-foreground mb-4 text-sm">{reactivate.body}</p>
        <Button
          onClick={() => action.execute({ action: 'reactivate', userId })}
          disabled={action.isPending}
        >
          <RiLockUnlockLine aria-hidden className="size-4" />
          {action.isPending ? change.submitting : reactivate.submit}
        </Button>
      </Card>
    );
  }

  function submit() {
    const trimmed = reason.trim();

    if (!trimmed) {
      toast.error(change.reasonRequired);
      return;
    }

    action.execute(
      measure === 'suspend'
        ? { action: 'suspend', userId, reason: trimmed, days }
        : { action: 'close', userId, reason: trimmed },
    );
  }

  return (
    <Card className="p-5">
      <h2 className="mb-3 font-medium">{change.title}</h2>

      <div
        className="mb-4 flex flex-wrap gap-2"
        role="group"
        aria-label={change.measureLabel}
      >
        <Chip
          pressed={measure === 'suspend'}
          className="border-input border"
          onClick={() => setMeasure('suspend')}
        >
          {change.suspend}
        </Chip>
        <Chip
          pressed={measure === 'close'}
          className="border-input border"
          onClick={() => setMeasure('close')}
        >
          {change.close}
        </Chip>
      </div>

      {measure === 'suspend' ? (
        <div className="mb-4">
          <p id="suspension-duration" className="mb-1 text-xs font-medium">
            {change.duration}
          </p>
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-labelledby="suspension-duration"
          >
            {SUSPENSION_DAYS.map((candidate) => (
              <Chip
                key={candidate}
                pressed={candidate === days}
                className="border-input border"
                onClick={() => setDays(candidate)}
              >
                {change.days(candidate)}
              </Chip>
            ))}
          </div>
        </div>
      ) : null}

      <label
        htmlFor="account-reason"
        className="mb-1 block text-xs font-medium"
      >
        {change.reasonLabel}
      </label>
      <p
        id="account-reason-hint"
        className="text-muted-foreground mb-1 text-xs"
      >
        {change.reasonHint}
      </p>
      <textarea
        id="account-reason"
        name="reason"
        rows={REASON_ROWS}
        required
        maxLength={MAX_ACCOUNT_REASON_LENGTH}
        aria-describedby="account-reason-hint"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        disabled={action.isPending}
        className="border-input bg-card focus-visible:ring-ring/30 w-full rounded-lg border px-3 py-2 text-sm focus-visible:ring-3 focus-visible:outline-none disabled:opacity-60"
      />

      <Alert
        severity="warning"
        description={
          measure === 'suspend' ? change.suspendWarning : change.closeWarning
        }
        className="mt-4"
      />

      <Button
        variant={measure === 'close' ? 'destructive' : 'default'}
        className="mt-4"
        onClick={submit}
        disabled={action.isPending}
      >
        {measure === 'close' ? (
          <RiProhibitedLine aria-hidden className="size-4" />
        ) : (
          <RiLockLine aria-hidden className="size-4" />
        )}
        {action.isPending
          ? change.submitting
          : measure === 'suspend'
            ? change.submitSuspend
            : change.submitClose}
      </Button>
    </Card>
  );
}
