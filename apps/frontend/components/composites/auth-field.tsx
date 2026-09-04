"use client";

import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import { useState, type ReactNode } from "react";

/** One labelled field of the authentication forms, styled like the prototype. */
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
}: {
  label: string;
  name: string;
  type: "text" | "email" | "password";
  autoComplete: string;
  placeholder?: string;
  minLength?: number;
  aide?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const aideId = aide ? `${name}-aide` : undefined;
  const revealable = type === "password";

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block font-display text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={revealable && revealed ? "text" : type}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={minLength}
          {...(onChange
            ? { value: value ?? "", onChange: (e) => onChange(e.target.value) }
            : {})}
          aria-describedby={aideId}
          required
          className={`w-full rounded border border-[color:var(--border)] bg-transparent px-3 py-2.5 font-serif text-sm transition-colors focus:border-[color:var(--primary)] focus:outline-none ${
            revealable ? "pr-11" : ""
          }`}
        />

        {revealable ? (
          <button
            type="button"
            onClick={() => setRevealed((shown) => !shown)}
            aria-label={
              revealed ? "Masquer le mot de passe" : "Afficher le mot de passe"
            }
            aria-pressed={revealed}
            aria-controls={name}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--primary)] focus-visible:text-[color:var(--primary)] focus-visible:outline-none"
          >
            {revealed ? (
              <RiEyeOffLine className="size-4" aria-hidden="true" />
            ) : (
              <RiEyeLine className="size-4" aria-hidden="true" />
            )}
          </button>
        ) : null}
      </div>

      {aide ? (
        <p
          id={aideId}
          className="mt-1.5 font-serif text-xs text-[color:var(--muted-foreground)]"
        >
          {aide}
        </p>
      ) : null}
    </div>
  );
}

/** The single action of an authentication form. */
export function BoutonAuth({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full rounded border-2 border-[color:var(--primary)] py-3 font-display text-sm font-semibold text-[color:var(--primary)] transition-colors hover:bg-[color:var(--secondary)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}
