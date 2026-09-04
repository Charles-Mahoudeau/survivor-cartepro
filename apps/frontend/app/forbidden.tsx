import { Button } from '@codegouvfr/react-dsfr/Button';

import { AuthShell } from '@/components/composites/auth-shell';
import { StartDsfrOnHydration } from '@/lib/dsfr';

export default function Forbidden() {
  return (
    <AuthShell
      titre="Accès refusé"
      sousTitre="Votre profil ne donne pas accès à cet espace."
    >
      <StartDsfrOnHydration />
      <p className="fr-text--sm fr-mb-3w text-[color:var(--muted-foreground)]">
        Chaque espace du dispositif est réservé à un profil. Revenez à votre
        espace ou reconnectez-vous avec un autre compte.
      </p>
      <Button priority="secondary" linkProps={{ href: '/login' }}>
        Retour à la connexion
      </Button>
    </AuthShell>
  );
}
