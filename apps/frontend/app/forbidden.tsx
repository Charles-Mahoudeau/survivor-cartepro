import Link from 'next/link';

import { AuthShell } from '@/components/composites/auth-shell';
import { Button } from '@/components/ui/button';

export default function Forbidden() {
  return (
    <AuthShell
      titre="Accès refusé"
      sousTitre="Votre profil ne donne pas accès à cet espace."
    >
      <p className="mb-6 text-sm text-muted-foreground">
        Chaque espace du dispositif est réservé à un profil. Revenez à votre
        espace ou reconnectez-vous avec un autre compte.
      </p>
      <Button asChild variant="outline" size="lg">
        <Link href="/login">Retour à la connexion</Link>
      </Button>
    </AuthShell>
  );
}
