const FRENCH_LOCALE = 'fr-FR';
const PARIS_TIME_ZONE = 'Europe/Paris';
const MS_PER_DAY = 86_400_000;

/** The single place a date is formatted. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(FRENCH_LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: PARIS_TIME_ZONE,
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(FRENCH_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: PARIS_TIME_ZONE,
  });
}

export function timeAgo(iso: string, now: Date = new Date()): string {
  const days = Math.floor(
    (now.getTime() - new Date(iso).getTime()) / MS_PER_DAY,
  );
  if (days <= 0) return 'Aujourd’hui';
  if (days === 1) return 'Hier';
  return `Il y a ${days} jours`;
}

interface DateTexteProps {
  iso: string;
  format: 'jour' | 'heure' | 'relatif';
  className?: string;
}

export function DateTexte({ iso, format, className }: DateTexteProps) {
  const text =
    format === 'jour'
      ? formatDate(iso)
      : format === 'heure'
        ? formatTime(iso)
        : timeAgo(iso);

  return (
    <time dateTime={iso} className={className}>
      {text}
    </time>
  );
}
