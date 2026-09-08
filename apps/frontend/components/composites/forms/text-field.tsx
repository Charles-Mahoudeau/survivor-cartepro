'use client';

import type { InputHTMLAttributes, ReactNode } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { Input } from '@/components/ui/input';

interface TextFieldProps {
  label: string;
  hint?: string;
  error?: string;
  registration: UseFormRegisterReturn;
  /** `type`, `autoComplete`, `inputMode`, `placeholder`… — the semantics browsers and password managers read. */
  input: InputHTMLAttributes<HTMLInputElement>;
  /** Rendered next to the control, such as the reveal toggle of a password. */
  action?: ReactNode;
}

export function TextField({
  label,
  hint,
  error,
  registration,
  input,
  action,
}: TextFieldProps) {
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
      <div className="relative">
        <Input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [hintId, errorId].filter(Boolean).join(' ') || undefined
          }
          className={action ? 'pr-11' : undefined}
          {...input}
          {...registration}
        />
        {action ? (
          <div className="absolute inset-y-0 right-1.5 flex items-center">
            {action}
          </div>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
