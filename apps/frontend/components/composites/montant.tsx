import { ME_CONTENT } from '@/content/me';
import type { Amount } from '@/lib/api/schemas/common/amount';

const FRENCH_LOCALE = 'fr-FR';
const DEFAULT_CURRENCY = 'EUR';

/** The single place a sum is formatted. */
export function formatAmount(
  amount: Amount,
  currency: string = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat(FRENCH_LOCALE, {
    style: 'currency',
    currency,
  }).format(Number(amount));
}

interface MontantProps {
  amount: Amount;
  currency?: string;
  /** `+` or `−` in front of the sum. */
  sign?: 'credit' | 'debit';
  /** The simulation mention is glued to the sum by default. */
  mention?: boolean;
  className?: string;
}

export function Montant({
  amount,
  currency,
  sign,
  mention = true,
  className = '',
}: MontantProps) {
  const prefix = sign === 'credit' ? '+' : sign === 'debit' ? '−' : '';

  return (
    <span className={`font-mono-data ${className}`}>
      {prefix}
      {formatAmount(amount, currency)}
      {mention ? (
        <>
          {' '}
          <span className="text-xs font-normal not-italic text-[color:var(--muted-foreground)]">
            {ME_CONTENT.simulation}
          </span>
        </>
      ) : null}
    </span>
  );
}
