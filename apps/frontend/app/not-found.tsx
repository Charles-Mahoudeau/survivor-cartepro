import Link from 'next/link';

import { AuthShell } from '@/components/composites/auth-shell';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <AuthShell
      titre="Page introuvable"
      sousTitre="Cette adresse ne correspond à aucun écran du dispositif."
    >
      <p className="mb-6 text-sm text-muted-foreground">
        Le lien est peut-être périmé, ou l’adresse a été saisie de travers.
      </p>
      <Button asChild variant="outline" size="lg">
        <Link href="/">Retour à l’accueil</Link>
      </Button>
    </AuthShell>
  );
}
