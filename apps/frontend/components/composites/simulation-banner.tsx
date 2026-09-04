/**
 * Legally required mention, worded by counsel: every amount in this
 * application is fictional. Shared so the sentence exists once.
 */
export function BandeauSimulation() {
  return (
    <div
      role="status"
      className="flex items-start gap-3 border-b border-[color:var(--warning-border)] bg-[color:var(--warning-light)] px-4 py-2.5 md:px-6"
    >
      <svg
        viewBox="0 0 24 24"
        className="mt-0.5 w-4 h-4 shrink-0 text-[color:var(--warning)]"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M10.3 3.9 2.5 18a1.5 1.5 0 0 0 1.3 2.3h16.4A1.5 1.5 0 0 0 21.5 18L13.7 3.9a1.5 1.5 0 0 0-2.6 0Z" />
        <path d="M12 9v4.5M12 17v.5" />
      </svg>
      <p className="font-display text-xs leading-relaxed text-[color:var(--warning)]">
        <span className="font-semibold">Simulation.</span>{" "}
        <span className="font-normal">
          Tous les montants affichés dans cette application sont fictifs. Aucune
          somme réelle n’est détenue, transférée ni encaissée.
        </span>
      </p>
    </div>
  );
}