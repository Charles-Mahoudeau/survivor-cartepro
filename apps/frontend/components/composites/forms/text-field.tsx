'use client';

import { Input } from '@codegouvfr/react-dsfr/Input';
import type { InputHTMLAttributes } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface TextFieldProps {
  label: string;
  hint?: string;
  error?: string;
  registration: UseFormRegisterReturn;
  /** `type`, `autoComplete`, `inputMode`, `placeholder`… — the semantics browsers and password managers read. */
  input: InputHTMLAttributes<HTMLInputElement>;
}

export function TextField({
  label,
  hint,
  error,
  registration,
  input,
}: TextFieldProps) {
  return (
    <Input
      label={label}
      hintText={hint}
      state={error ? 'error' : 'default'}
      stateRelatedMessage={error}
      nativeInputProps={{ id: registration.name, ...input, ...registration }}
    />
  );
}
