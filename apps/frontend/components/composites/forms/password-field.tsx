'use client';

import { Button } from '@codegouvfr/react-dsfr/Button';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

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
    <Input
      label={label}
      hintText={hint}
      state={error ? 'error' : 'default'}
      stateRelatedMessage={error}
      nativeInputProps={{
        id: registration.name,
        type: revealed ? 'text' : 'password',
        autoComplete,
        minLength,
        spellCheck: false,
        autoCapitalize: 'none',
        ...registration,
      }}
      action={
        <Button
          type="button"
          priority="tertiary"
          iconId={revealed ? 'fr-icon-eye-off-line' : 'fr-icon-eye-line'}
          title={revealed ? hide : show}
          nativeButtonProps={{
            'aria-pressed': revealed,
            'aria-controls': registration.name,
          }}
          onClick={() => setRevealed((shown) => !shown)}
        />
      }
    />
  );
}
