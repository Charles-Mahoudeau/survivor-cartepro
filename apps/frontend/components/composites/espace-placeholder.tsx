import { Card } from '@/components/composites/card';
import { BandeauSimulation } from '@/components/composites/simulation-banner';
import { SiteHeader } from '@/components/composites/site-header.client';
import type { CurrentUser } from '@/lib/auth/session';

export function EspacePlaceholder({
  titre,
  user,
}: {
  titre: string;
  user: CurrentUser;
}) {
  return (
    <>
      <SiteHeader user={{ name: user.name }} />
      <BandeauSimulation />

      <main id="contenu" className="fr-container fr-py-6w flex-1">
        <div className="fr-grid-row fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
            <h1 className="fr-h3 fr-mb-1w">{titre}</h1>
            <p className="fr-text--sm fr-mb-4w text-[color:var(--muted-foreground)]">
              Session ouverte. Les écrans de cet espace restent à construire.
            </p>

            <Card className="p-6">
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
                <dt className="font-display text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]">
                  Compte
                </dt>
                <dd className="font-serif text-sm">{user.name}</dd>
                <dt className="font-display text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]">
                  Adresse
                </dt>
                <dd className="font-mono-data text-sm">{user.email}</dd>
                <dt className="font-display text-xs font-medium uppercase tracking-wider text-[color:var(--muted-foreground)]">
                  Rôle
                </dt>
                <dd className="font-serif text-sm">{user.role}</dd>
              </dl>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
