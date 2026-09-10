'use client';

import type { TextareaHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { cn } from '@/lib/utils';

interface TextAreaFieldProps {
  label: string;
  hint?: string;
  error?: string;
  registration: UseFormRegisterReturn;
  textarea?: TextareaHTMLAttributes<HTMLTextAreaElement>;
}

/** A labelled multi-line field, wired to its hint and error like `TextField`. */
export function TextAreaField({
  label,
  hint,
  error,
  registration,
  textarea,
}: TextAreaFieldProps) {
  const id = registration.name;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-foreground"
      >
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="mb-1 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hintId, errorId].filter(Boolean).join(' ') || undefined
        }
        {...textarea}
        className={cn(
          'border-input bg-card focus-visible:ring-ring/30 aria-invalid:border-destructive w-full rounded-lg border px-3 py-2 text-sm focus-visible:ring-3 focus-visible:outline-none disabled:opacity-60',
          textarea?.className,
        )}
        {...registration}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
