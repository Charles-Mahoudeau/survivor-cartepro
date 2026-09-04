'use client';

import { Button } from '@codegouvfr/react-dsfr/Button';
import { Input } from '@codegouvfr/react-dsfr/Input';
import { useState, type ReactNode } from 'react';

export function ChampAuth({
  label,
  name,
  type,
  autoComplete,
  placeholder,
  minLength,
  aide,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  type: 'text' | 'email' | 'password';
  autoComplete: string;
  placeholder?: string;
  minLength?: number;
  aide?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const revealable = type === 'password';

  return (
    <Input
      label={label}
      hintText={aide}
      state={error ? 'error' : 'default'}
      stateRelatedMessage={error}
      nativeInputProps={{
        id: name,
        name,
        type: revealable && revealed ? 'text' : type,
        autoComplete,
        placeholder,
        minLength,
        ...(onChange
          ? { value: value ?? '', onChange: (e) => onChange(e.target.value) }
          : {}),
      }}
      action={
        revealable ? (
          <Button
            type="button"
            priority="tertiary"
            iconId={revealed ? 'fr-icon-eye-off-line' : 'fr-icon-eye-line'}
            title={
              revealed ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
            }
            nativeButtonProps={{
              'aria-pressed': revealed,
              'aria-controls': name,
            }}
            onClick={() => setRevealed((shown) => !shown)}
          />
        ) : undefined
      }
    />
  );
}

export function BoutonAuth({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Button
      type="submit"
      priority="primary"
      disabled={disabled}
      className="w-full justify-center"
    >
      {children}
    </Button>
  );
}
