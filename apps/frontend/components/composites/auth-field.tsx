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
  const aideId = aide ? `${name}-aide` : undefined;

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block font-display text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        minLength={minLength}
        {...(onChange
          ? { value: value ?? "", onChange: (e) => onChange(e.target.value) }
          : {})}
        aria-describedby={aideId}
        required
        className="w-full rounded border border-[color:var(--border)] bg-transparent px-3 py-2.5 font-serif text-sm transition-colors focus:border-[color:var(--primary)] focus:outline-none"
      />
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
  children: React.ReactNode;
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

/** Refusals are announced, not whispered: role="alert" moves focus to them. */
export function AlerteAuth({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded border border-[color:var(--destructive)] bg-[color:var(--destructive-light,transparent)] px-3 py-2.5 font-serif text-sm text-[color:var(--destructive)]"
    >
      {children}
    </p>
  );
}
