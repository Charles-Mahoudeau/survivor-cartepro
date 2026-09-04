import type { Metadata } from 'next';

import { BlocMarque } from '@/components/composites/brand-block';
import { PiedDePage } from '@/components/composites/pied-de-page';
import { BandeauSimulation } from '@/components/composites/simulation-banner';
import { ACCESSIBILITE_CONTENT } from '@/content/accessibilite';

export const metadata: Metadata = {
  title: 'Déclaration d’accessibilité — Ticket Tout (simulation)',
  description:
    'État de conformité de Ticket Tout au référentiel général d’amélioration de l’accessibilité (RGAA) version 4.1.',
};

const NON_CONFORMITES = [
  'Les champs du formulaire de connexion de la page d’accueil et le champ « Motif » n’ont pas d’étiquette exploitable ; le champ de recherche du catalogue n’a qu’un texte de substitution (critère 11.1).',
  'Les lignes de la liste des partenaires ne peuvent être ni atteintes ni activées au clavier (critères 7.1 et 7.3).',
  'Aucune page ne propose de lien d’évitement vers le contenu principal (critère 12.7).',
  'Le QR code de paiement n’expose pas son alternative textuelle de façon fiable (critère 1.1).',
  'Vingt images vectorielles décoratives sur vingt et une ne sont pas masquées aux technologies d’assistance (critère 1.2).',
  'Deux couleurs de texte n’atteignent pas le rapport de contraste de 4,5:1 (critère 3.2).',
  'La bordure des champs de saisie n’atteint pas le rapport de contraste de 3:1 (critère 3.3).',
  'Les liens placés dans un texte ne se distinguent pas suffisamment du texte environnant (critère 10.6).',
  'La prise de focus n’est pas visible sur les champs de saisie ni sur le bouton d’affichage du mot de passe (critère 10.7).',
  'Le formulaire de la page d’accueil ne comporte aucun contrôle de saisie (critère 11.10).',
  'La finalité des champs de la page d’accueil n’est pas déclarée, ce qui empêche le remplissage automatique (critère 11.13).',
  'Le service ne dispose que d’un seul système de navigation : il n’existe ni plan du site, ni moteur de recherche (critère 12.1).',
];

const TECHNOLOGIES = [
  'HTML5',
  'CSS (Tailwind CSS 4)',
  'JavaScript et TypeScript (React 19, Next.js 16)',
  'WAI-ARIA',
];

const OUTILS = [
  'Lecture du code source de l’application',
  'Calcul des rapports de contraste selon la formule de luminance relative WCAG 2.1',
  'Grille des 106 critères du RGAA 4.1 publiée par la direction interministérielle du numérique',
];

const PAGES = [
  'Accueil et démonstrateur — /',
  'Connexion — /login',
  'Création de compte — /signup',
  'Solde salarié — /me',
  'Historique des mouvements — /me/history',
  'Catalogue des partenaires — /me/partners',
  'Écran « Accès refusé », rendu sans URL propre',
  'Espace partenaire — /pro',
  'Espace administration — /admin',
  'Déclaration d’accessibilité — /accessibilite',
];

function Section({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 font-display text-lg font-semibold text-[color:var(--foreground)]">
        {titre}
      </h2>
      {children}
    </section>
  );
}

function Liste({ items }: { items: readonly string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 font-serif text-sm text-[color:var(--foreground)]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function AccessibilitePage() {
  const {
    entite,
    service,
    etabliLe,
    revision,
    contact,
    tauxApplicables,
    criteresConformes,
    criteresApplicables,
    criteresNonConformes,
    criteresNonTestes,
  } = ACCESSIBILITE_CONTENT;

  return (
    <>
      <header className="border-b border-[color:var(--border)] bg-[color:var(--card)] px-6 py-5">
        <BlocMarque />
      </header>
      <BandeauSimulation />

      <main id="contenu" className="mx-auto w-full max-w-[720px] flex-1 px-4 py-10">
        <h1 className="mb-6 font-display text-2xl font-semibold text-[color:var(--foreground)] md:text-3xl">
          Déclaration d’accessibilité
        </h1>

        <p className="font-serif text-sm text-[color:var(--foreground)]">
          {entite} s’engage à rendre son service accessible conformément à
          l’article 47 de la loi n° 2005-102 du 11 février 2005.
        </p>
        <p className="mt-3 font-serif text-sm text-[color:var(--foreground)]">
          Cette déclaration d’accessibilité s’applique à {service}.
        </p>
        <p className="mt-3 font-serif text-sm text-[color:var(--foreground)]">
          Le schéma pluriannuel de mise en accessibilité et son plan d’action
          annuel ne sont pas encore établis. Leur publication est prévue avant
          le 31 octobre 2026.
        </p>

        <Section titre="État de conformité">
          <p className="font-serif text-sm text-[color:var(--foreground)]">
            <strong className="font-display font-semibold">
              {service} est non conforme
            </strong>{' '}
            avec le référentiel général d’amélioration de l’accessibilité
            (RGAA), version 4.1.
          </p>
          <p className="mt-3 font-serif text-sm text-[color:var(--foreground)]">
            La non-conformité est prononcée au titre de l’absence de résultat
            d’audit en cours de validité : l’évaluation réalisée est une revue
            du code source, sans test de restitution par une technologie
            d’assistance ni test sur page rendue.{' '}
            {criteresNonTestes} critères applicables n’ont pas pu être évalués.
          </p>
        </Section>

        <Section titre="Résultats des tests">
          <p className="font-serif text-sm text-[color:var(--foreground)]">
            L’évaluation, réalisée en interne le {etabliLe} sur la révision{' '}
            <code className="font-mono-data text-xs">{revision}</code>, révèle
            que :
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 font-serif text-sm text-[color:var(--foreground)]">
            <li>
              <strong className="font-display font-semibold">
                {tauxApplicables}
              </strong>{' '}
              des critères applicables du RGAA 4.1 sont respectés, soit{' '}
              {criteresConformes} critères conformes sur {criteresApplicables}{' '}
              applicables, les critères non évalués étant décomptés comme non
              respectés ;
            </li>
            <li>
              {criteresNonConformes} critères sont non conformes et{' '}
              {criteresNonTestes} n’ont pas pu être évalués ;
            </li>
            <li>
              51 des 106 critères sont non applicables : le service ne comporte
              ni cadre, ni tableau de données, ni média temporel.
            </li>
          </ul>
        </Section>

        <Section titre="Contenus non accessibles">
          <h3 className="mb-2 font-display text-base font-semibold text-[color:var(--foreground)]">
            Non-conformités
          </h3>
          <Liste items={NON_CONFORMITES} />
          <p className="mt-3 font-serif text-sm text-[color:var(--foreground)]">
            Sont également absentes les pages obligatoires contact, mentions
            légales, plan du site et aide. Sauf mention contraire, la correction
            de ces défauts est prévue avant le 30 septembre 2026 ; la création
            des pages manquantes et d’un second système de navigation avant le
            31 octobre 2026.
          </p>

          <h3 className="mb-2 mt-6 font-display text-base font-semibold text-[color:var(--foreground)]">
            Dérogations pour charge disproportionnée
          </h3>
          <p className="font-serif text-sm text-[color:var(--foreground)]">
            Néant.
          </p>

          <h3 className="mb-2 mt-6 font-display text-base font-semibold text-[color:var(--foreground)]">
            Contenus non soumis à l’obligation d’accessibilité
          </h3>
          <p className="font-serif text-sm text-[color:var(--foreground)]">
            Néant.
          </p>
        </Section>

        <Section titre="Établissement de cette déclaration">
          <p className="font-serif text-sm text-[color:var(--foreground)]">
            Cette déclaration a été établie le {etabliLe}. Elle n’a pas encore
            été mise à jour.
          </p>

          <h3 className="mb-2 mt-6 font-display text-base font-semibold text-[color:var(--foreground)]">
            Technologies utilisées
          </h3>
          <Liste items={TECHNOLOGIES} />

          <h3 className="mb-2 mt-6 font-display text-base font-semibold text-[color:var(--foreground)]">
            Environnement de test
          </h3>
          <p className="font-serif text-sm text-[color:var(--foreground)]">
            Aucun. Les vérifications de restitution sur la base de référence du
            RGAA — Firefox avec NVDA, Safari avec VoiceOver — n’ont pas été
            réalisées. C’est le motif de la non-conformité prononcée ci-dessus.
          </p>

          <h3 className="mb-2 mt-6 font-display text-base font-semibold text-[color:var(--foreground)]">
            Outils utilisés lors de l’évaluation
          </h3>
          <Liste items={OUTILS} />

          <h3 className="mb-2 mt-6 font-display text-base font-semibold text-[color:var(--foreground)]">
            Pages ayant fait l’objet de la vérification de conformité
          </h3>
          <Liste items={PAGES} />
          <p className="mt-3 font-serif text-sm text-[color:var(--foreground)]">
            Les pages contact, mentions légales, plan du site et aide,
            obligatoires dans l’échantillon, n’existent pas à ce jour.
          </p>
        </Section>

        <Section titre="Retour d’information et contact">
          <p className="font-serif text-sm text-[color:var(--foreground)]">
            Si vous n’arrivez pas à accéder à un contenu ou à un service, vous
            pouvez contacter le responsable de {service} pour être orienté vers
            une alternative accessible ou obtenir le contenu sous une autre
            forme.
          </p>
          <p className="mt-3 font-serif text-sm text-[color:var(--foreground)]">
            Écrire à{' '}
            <a
              href={`mailto:${contact}`}
              className="text-[color:var(--primary)] underline underline-offset-2 hover:no-underline"
            >
              {contact}
            </a>
            , ou contacter le {entite}, direction du numérique et de
            l’innovation, référence JEB/DNI/2026-002.
          </p>
          <p className="mt-3 font-serif text-sm text-[color:var(--foreground)]">
            Nous accusons réception de votre réclamation et vous répondons dans
            un délai d’une semaine à compter de son envoi. Si votre demande
            soulève des questions complexes, notre réponse vous indique un délai
            raisonnable pour la réponse définitive.
          </p>
        </Section>

        <Section titre="Voies de recours">
          <p className="font-serif text-sm text-[color:var(--foreground)]">
            Si vous constatez un défaut d’accessibilité vous empêchant d’accéder
            à un contenu ou une fonctionnalité du site, que vous nous le
            signalez et que vous ne parvenez pas à obtenir une réponse de notre
            part, vous êtes en droit de faire parvenir vos doléances ou une
            demande de saisine au Défenseur des droits.
          </p>
          <p className="mt-3 font-serif text-sm text-[color:var(--foreground)]">
            Plusieurs moyens sont à votre disposition :
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 font-serif text-sm text-[color:var(--foreground)]">
            <li>
              <a
                href="https://formulaire.defenseurdesdroits.fr/"
                className="text-[color:var(--primary)] underline underline-offset-2 hover:no-underline"
              >
                Écrire un message au Défenseur des droits
              </a>
            </li>
            <li>
              <a
                href="https://www.defenseurdesdroits.fr/carte-des-delegues"
                className="text-[color:var(--primary)] underline underline-offset-2 hover:no-underline"
              >
                Contacter le délégué du Défenseur des droits dans votre région
              </a>
            </li>
            <li>
              Envoyer un courrier par la poste, gratuitement, sans
              affranchissement :
              <address className="mt-1 not-italic">
                Défenseur des droits
                <br />
                Libre réponse 71120
                <br />
                75342 Paris CEDEX 07
              </address>
            </li>
          </ul>
        </Section>
      </main>

      <PiedDePage />
    </>
  );
}
