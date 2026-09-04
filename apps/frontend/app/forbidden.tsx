import Link from 'next/link';

import { AuthShell } from '@/components/composites/auth-shell';
import { Card } from '@/components/composites/card';

export default function Forbidden() {
  return (
    <AuthShell
      titre="Accès refusé"
      sousTitre="Votre profil ne donne pas accès à cet espace."
    >
      <Card className="p-6">
        <p className="mb-4 font-serif text-sm text-[color:var(--muted-foreground)]">
          Chaque espace du dispositif est réservé à un profil. Revenez à votre
          espace ou reconnectez-vous avec un autre compte.
        </p>
        <Link
          href="/login"
          className="inline-block rounded border-2 border-[color:var(--primary)] px-4 py-2 font-display text-sm font-semibold text-[color:var(--primary)] transition-colors hover:bg-[color:var(--secondary)]"
        >
          Retour à la connexion
        </Link>
      </Card>
    </AuthShell>
  );
}
