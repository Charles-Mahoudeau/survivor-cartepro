'use client';

import { RiEyeLine, RiEyeOffLine } from '@remixicon/react';
import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { TextField } from '@/components/composites/forms/text-field';
import { Button } from '@/components/ui/button';
import { AUTH_CONTENT } from '@/content/auth';

interface PasswordFieldProps {
  label: string;
  hint?: string;
  error?: string;
  registration: UseFormRegisterReturn;
  /** `current-password` on sign-in, `new-password` on sign-up. */
  autoComplete: 'current-password' | 'new-password';
  minLength?: number;
}

export function PasswordField({
  label,
  hint,
  error,
  registration,
  autoComplete,
  minLength,
}: PasswordFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const { show, hide } = AUTH_CONTENT.fields.password;

  return (
    <TextField
      label={label}
      hint={hint}
      error={error}
      registration={registration}
      input={{
        type: revealed ? 'text' : 'password',
        autoComplete,
        minLength,
        spellCheck: false,
        autoCapitalize: 'none',
      }}
      action={
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title={revealed ? hide : show}
          aria-label={revealed ? hide : show}
          aria-pressed={revealed}
          aria-controls={registration.name}
          onClick={() => setRevealed((shown) => !shown)}
        >
          {revealed ? <RiEyeOffLine /> : <RiEyeLine />}
        </Button>
      }
    />
  );
}
