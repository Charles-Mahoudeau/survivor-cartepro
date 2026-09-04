# Déclaration d'accessibilité

Le **Ministère du Job et Bonheur** s'engage à rendre son service accessible
conformément à l'article 47 de la loi n° 2005-102 du 11 février 2005.

À cette fin, il met en œuvre la stratégie et les actions suivantes :

- Schéma pluriannuel de mise en accessibilité : **non encore établi** — voir §
  « Contenus non accessibles ».
- Plan d'action de l'année en cours : le plan de correction figure ci-dessous,
  faute de schéma pluriannuel publié à ce jour.

Cette déclaration d'accessibilité s'applique à **Ticket Tout**
(`https://tickettout.gouv.fr` — dispositif de simulation, sans valeur monétaire
réelle).

## État de conformité

**Ticket Tout est non conforme** avec le référentiel général d'amélioration de
l'accessibilité (RGAA), version 4.1.

La non-conformité est prononcée au titre du premier motif prévu par le
référentiel : **il n'existe pas de résultat d'audit en cours de validité**
permettant de mesurer le respect des critères. L'évaluation réalisée est une
revue statique du code source ; elle ne comporte ni test de restitution par une
technologie d'assistance, ni test sur page rendue, alors que le RGAA impose une
base de référence de couples navigateur / lecteur d'écran. Sept critères
applicables sur cinquante-cinq n'ont donc pas pu être évalués.

Le taux mesuré n'est pas invoqué pour prononcer une conformité partielle : il est
donné ci-dessous à titre d'information sur l'état réel du service.

### Résultats des tests

L'évaluation, réalisée en interne le 4 septembre 2026, révèle que :

- **63,6 % des critères applicables du RGAA 4.1 sont respectés** — 35 critères
  conformes sur 55 applicables, les 7 critères non évalués étant décomptés comme
  non respectés ;
- sur le seul périmètre effectivement évalué, 35 critères sont conformes et 13
  non conformes, soit **72,9 % sur 48 critères** ;
- 51 des 106 critères sont non applicables au service dans son état actuel : il
  ne comporte ni cadre, ni tableau de données, ni média temporel.

## Contenus non accessibles

### Non-conformités

Treize critères sont non conformes. Les défauts ci-dessous sont ordonnés par
l'obstacle qu'ils créent pour l'utilisateur.

1. **Les champs de la page d'accueil n'ont pas d'étiquette exploitable**
   (critère 11.1). Les balises `<label>` du formulaire de connexion et du champ
   « Motif » ne portent pas d'attribut `for`, et les champs correspondants n'ont
   pas d'`id` ; le champ de recherche du catalogue n'a qu'un texte de
   substitution. Un lecteur d'écran annonce un champ sans nom. Les pages
   `/login` et `/signup` ne présentent pas ce défaut. Correction avant le
   30 septembre 2026.
2. **La liste des partenaires n'est pas utilisable au clavier** (critères 7.1 et
   7.3). Chaque ligne est un `<div>` porteur d'un gestionnaire de clic, sans
   rôle ni possibilité de recevoir le focus : la fiche d'un partenaire est
   inatteignable sans souris. Correction avant le 30 septembre 2026.
3. **Aucun lien d'évitement** (critère 12.7). Aucune page ne permet de sauter la
   navigation pour atteindre le contenu principal, alors que la cible
   `#contenu` existe déjà dans l'espace salarié. Correction avant le
   30 septembre 2026.
4. **Le QR code de paiement n'a pas d'alternative exploitable** (critère 1.1).
   L'image vectorielle porte un `aria-label` sans `role="img"` : l'alternative
   n'est pas restituée de façon fiable. Correction avant le 30 septembre 2026.
5. **Les icônes décoratives ne sont pas masquées aux technologies d'assistance**
   (critère 1.2). Vingt images vectorielles sur vingt et une sont dépourvues
   d'`aria-hidden="true"`. Correction avant le 30 septembre 2026.
6. **Deux contrastes de texte sont insuffisants** (critère 3.2). Le texte
   secondaire sur le fond de page atteint 4,43:1 et le libellé du statut
   « suspendu » 4,24:1, pour un seuil de 4,5:1. Correction avant le
   30 septembre 2026.
7. **La bordure des champs de saisie est insuffisamment contrastée**
   (critère 3.3). Elle atteint 1,31:1 sur carte blanche et 1,20:1 sur le fond de
   page, pour un seuil de 3:1 : la limite du champ n'est pas perceptible.
   Correction avant le 30 septembre 2026.
8. **Les liens dans le texte ne se distinguent pas assez** (critère 10.6). Le
   contraste entre la couleur du lien et celle du texte environnant est de
   2,33:1, pour un seuil de 3:1, et le soulignement n'apparaît qu'au survol.
   Correction avant le 30 septembre 2026.
9. **La prise de focus n'est pas toujours visible** (critère 10.7). Les champs
   de saisie neutralisent le contour du navigateur au profit d'un simple
   changement de couleur de bordure ; le bouton d'affichage du mot de passe le
   neutralise au profit d'un changement de couleur de texte seul. Correction
   avant le 30 septembre 2026.
10. **Le formulaire de la page d'accueil n'a aucun contrôle de saisie**
    (critère 11.10), contrairement aux pages `/login` et `/signup`. Correction
    avant le 30 septembre 2026.
11. **La finalité des champs de la page d'accueil n'est pas déclarée**
    (critère 11.13) : les attributs `autocomplete` y sont absents, ce qui
    empêche le remplissage automatique. Correction avant le 30 septembre 2026.
12. **Le service ne dispose que d'un seul système de navigation**
    (critère 12.1). Il n'existe ni plan du site, ni moteur de recherche portant
    sur l'ensemble du service. Correction avant le 31 octobre 2026.

Sont également absentes les pages obligatoires **contact**, **mentions
légales**, **plan du site** et **aide**, ainsi que le **schéma pluriannuel de
mise en accessibilité** et son plan d'action annuel. Leur établissement est
prévu avant le 31 octobre 2026.

### Dérogations pour charge disproportionnée

Néant.

### Contenus non soumis à l'obligation d'accessibilité

Néant.

## Établissement de cette déclaration d'accessibilité

Cette déclaration a été établie le **4 septembre 2026**. Elle n'a pas encore été
mise à jour.

Elle porte sur l'état du dépôt à la révision `8320a08`, complété par la
présente page `/accessibilite` et le pied de page qui la rend atteignable,
livrés avec cette déclaration et évalués selon la même méthode.

### Technologies utilisées pour la réalisation du service

- HTML5
- CSS (Tailwind CSS 4)
- JavaScript / TypeScript (React 19, Next.js 16)
- WAI-ARIA

### Environnement de test

**Aucun.** L'évaluation a été menée sur le code source, sans rendu de page ni
technologie d'assistance. C'est le motif principal de la non-conformité
prononcée ci-dessus : le RGAA impose des vérifications de restitution sur une
base de référence de couples navigateur / lecteur d'écran (Firefox et NVDA,
Safari et VoiceOver), qui n'ont pas été réalisées.

### Les outils utilisés lors de l'évaluation

- Lecture du code source (`app/`, `components/`, `lib/`, `app/globals.css`)
- Calcul des rapports de contraste selon la formule de luminance relative WCAG 2.1,
  appliqué aux jetons de couleur déclarés dans `app/globals.css`
- Grille des 106 critères du RGAA 4.1, dans sa version publiée par la DINUM

### Pages du service ayant fait l'objet de la vérification de conformité

1. Accueil et démonstrateur — `/`
2. Connexion — `/login`
3. Création de compte — `/signup`
4. Solde salarié — `/me`
5. Historique des mouvements — `/me/history`
6. Catalogue des partenaires — `/me/partners`
7. Écran « Accès refusé » — rendu par `forbidden()`, sans URL propre
8. Espace partenaire — `/pro`
9. Espace administration — `/admin`
10. Déclaration d'accessibilité — `/accessibilite`

Les pages contact, mentions légales, plan du site et aide, obligatoires dans
l'échantillon, n'existent pas à ce jour et n'ont donc pas pu être auditées.

## Retour d'information et contact

Si vous n'arrivez pas à accéder à un contenu ou à un service, vous pouvez
contacter le responsable de Ticket Tout pour être orienté vers une alternative
accessible ou obtenir le contenu sous une autre forme.

- Envoyer un message : `accessibilite@tickettout.gouv.fr` **[adresse à confirmer
  avant publication]**
- Contacter le Ministère du Job et Bonheur, direction du numérique et de
  l'innovation — référence `JEB/DNI/2026-002`.

Nous accusons réception de votre réclamation et vous répondons dans un délai
d'une semaine à compter de son envoi. Si votre demande soulève des questions
complexes, notre réponse vous indique un délai raisonnable pour la réponse
définitive.

## Voies de recours

Si vous constatez un défaut d'accessibilité vous empêchant d'accéder à un
contenu ou une fonctionnalité du site, que vous nous le signalez et que vous ne
parvenez pas à obtenir une réponse de notre part, vous êtes en droit de faire
parvenir vos doléances ou une demande de saisine au Défenseur des droits.

Plusieurs moyens sont à votre disposition :

- Écrire un message au Défenseur des droits :
  <https://formulaire.defenseurdesdroits.fr/>
- Contacter le délégué du Défenseur des droits dans votre région :
  <https://www.defenseurdesdroits.fr/carte-des-delegues>
- Envoyer un courrier par la poste, gratuitement, sans affranchissement :

  Défenseur des droits
  Libre réponse 71120
  75342 Paris CEDEX 07

---

## Sources

- Loi n° 2005-102 du 11 février 2005, article 47 —
  <https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000809647/>
- Décret n° 2019-768 du 24 juillet 2019 —
  <https://www.legifrance.gouv.fr/loda/id/JORFTEXT000038811937/>
- RGAA 4.1, obligations et modèle de déclaration —
  <https://accessibilite.numerique.gouv.fr/obligations/declaration-accessibilite/>
- RGAA 4.1, mentions et pages obligatoires —
  <https://accessibilite.numerique.gouv.fr/obligations/mentions-et-pages-obligatoires/>
- RGAA 4.1, évaluation de la conformité —
  <https://accessibilite.numerique.gouv.fr/obligations/evaluation-conformite/>
- Exemple de déclaration d'accessibilité, DesignGouv —
  <https://design.numerique.gouv.fr/outils/exemple-declaration-accessibilite/>
