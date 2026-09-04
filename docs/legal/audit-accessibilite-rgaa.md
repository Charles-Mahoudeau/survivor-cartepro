# Audit d'accessibilité RGAA 4.1 de Ticket Tout

> Pièce justificative de la [déclaration d'accessibilité](./declaration-accessibilite.md).
> Évaluation menée le 04/09/2026 en interne, sur la révision `8320a08`
> complétée par la page `/accessibilite` et le pied de page livrés avec la
> déclaration.
> Référentiel : RGAA 4.1, 106 critères, arrêté du 20 septembre 2019 modifié.

## 1. Ce qui a été évalué, et ce qui ne l'a pas été

L'évaluation est une **revue statique du code source**. Elle n'a comporté ni
rendu de page, ni test avec une technologie d'assistance. Ce n'est donc pas un
audit RGAA complet, et c'est la raison pour laquelle la déclaration prononce la
non-conformité au titre de l'absence d'audit en cours de validité, sans invoquer
le taux mesuré.

Règle appliquée pour classer un critère : **il n'est déclaré conforme que si le
code source suffit à conclure**. Tout ce qui exige un rendu, un validateur ou un
lecteur d'écran est classé « non testé ».

| Verdict | Sens                                                            | Nombre |
| ------- | --------------------------------------------------------------- | -----: |
| C       | Conforme, établi sur le code source                             |     35 |
| NC      | Non conforme, défaut localisé dans le code                      |     13 |
| NA      | Non applicable en l'état du service                             |     51 |
| NT      | Non testé : exige un rendu, un validateur ou un lecteur d'écran |      7 |

**Taux de conformité** = critères conformes / critères applicables.
Applicables = 106 − 51 = **55**.

| Base de calcul                                      | Taux       |
| --------------------------------------------------- | ---------- |
| 35 / 55, les non testés comptés comme non respectés | **63,6 %** |
| 35 / 48, sur le seul périmètre réellement évalué    | **72,9 %** |

12,7 % du référentiel applicable n'a pas pu être évalué.

## 2. Échantillon

Le RGAA impose d'inclure, lorsqu'elles existent, les pages d'accueil, de contact,
de mentions légales, d'accessibilité, de plan du site, d'aide et
d'authentification.

| #   | Page                        | URL              | Statut                     |
| --- | --------------------------- | ---------------- | -------------------------- |
| 1   | Accueil et démonstrateur    | `/`              | Auditée                    |
| 2   | Connexion                   | `/login`         | Auditée (authentification) |
| 3   | Création de compte          | `/signup`        | Auditée (authentification) |
| 4   | Solde salarié               | `/me`            | Auditée                    |
| 5   | Historique des mouvements   | `/me/history`    | Auditée                    |
| 6   | Catalogue des partenaires   | `/me/partners`   | Auditée (recherche)        |
| 7   | Écran « Accès refusé »      | `forbidden()`    | Auditée (sans URL propre)  |
| 8   | Espace partenaire           | `/pro`           | Auditée                    |
| 9   | Espace administration       | `/admin`         | Auditée                    |
| 10  | Déclaration d'accessibilité | `/accessibilite` | Auditée                    |
|     | Contact                     |                  | **N'existe pas**           |
|     | Mentions légales            |                  | **N'existe pas**           |
|     | Plan du site                |                  | **N'existe pas**           |
|     | Aide                        |                  | **N'existe pas**           |

Un critère est déclaré conforme s'il l'est sur **toutes** les pages de
l'échantillon. C'est pourquoi plusieurs critères respectés dans l'espace salarié
sont comptés non conformes : `app/page.tsx` est un démonstrateur client qui
réimplémente les mêmes écrans sans reprendre le travail d'accessibilité fait
dans les composants réels.

## 3. Les treize non-conformités, localisées

| Critère | Défaut                                                                              | Où                                                                      |
| ------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1.1     | `<svg>` du QR code : `aria-label` sans `role="img"`                                 | `app/page.tsx:478`                                                      |
| 1.2     | 20 `<svg>` décoratifs sur 21 sans `aria-hidden="true"`                              | `app/page.tsx` (14/14), `components/icons/index.tsx` (6/7)              |
| 3.2     | Texte 4,43:1 et 4,24:1 pour un seuil de 4,5:1                                       | `app/globals.css`, `--muted-foreground` sur `--background` et `--muted` |
| 3.3     | Bordure de champ 1,31:1 et 1,20:1 pour un seuil de 3:1                              | `app/globals.css`, `--border` sur `--card` et `--background`            |
| 7.1     | Ligne de partenaire : `onClick` sur un `<div>`, sans rôle                           | `components/composites/card.tsx:5`, appelé `app/page.tsx:972`           |
| 7.3     | La même ligne ne peut pas recevoir le focus ni être activée                         | idem                                                                    |
| 10.6    | Lien dans le texte : 2,33:1 vs le texte environnant, souligné au survol seulement   | `app/(public)/login/login-form.client.tsx:118`                          |
| 10.7    | `focus:outline-none` remplacé par une bordure ; bouton œil : couleur de texte seule | `components/composites/auth-field.tsx:81,101`                           |
| 11.1    | `<label>` sans `for`, champs sans `id` ; recherche sans étiquette                   | `app/page.tsx:280,283,291,294,682,1090,1094`                            |
| 11.10   | Formulaire de connexion du démonstrateur sans contrôle de saisie                    | `app/page.tsx:276`                                                      |
| 11.13   | Champs du démonstrateur sans `autocomplete`                                         | `app/page.tsx:283,294`                                                  |
| 12.1    | Un seul système de navigation : ni plan du site, ni recherche globale               | ensemble du service                                                     |
| 12.7    | Aucun lien d'évitement ; la cible `#contenu` existe pourtant                        | `app/(protected)/me/layout.tsx:18`                                      |

### Contrastes mesurés

Calcul par la formule de luminance relative WCAG 2.1, sur les jetons déclarés
dans `app/globals.css`.

| Paire                                             | Rapport | Seuil | Verdict |
| ------------------------------------------------- | ------: | ----: | ------- |
| `#6b7280` sur `#f5f5f3`, texte secondaire         |  4,43:1 | 4,5:1 | Échec   |
| `#6b7280` sur `#f0f0ee`, statut « suspendu »      |  4,24:1 | 4,5:1 | Échec   |
| `#dde1ea` sur `#ffffff`, bordure de champ         |  1,31:1 |   3:1 | Échec   |
| `#dde1ea` sur `#f5f5f3`, bordure de champ         |  1,20:1 |   3:1 | Échec   |
| `#1b3a6b` vs `#6b7280`, lien vs texte environnant |  2,33:1 |   3:1 | Échec   |
| `#6b7280` sur `#ffffff`, texte sur carte          |  4,83:1 | 4,5:1 | OK      |
| `#1a1a2e` sur `#ffffff`, texte principal          | 17,06:1 | 4,5:1 | OK      |
| `#1b3a6b` sur `#ffffff`, primary sur blanc        | 11,27:1 | 4,5:1 | OK      |
| `#d93b3b` sur `#ffffff`, message d'erreur         |  4,53:1 | 4,5:1 | OK      |
| `#b45309` sur `#fef3c7`, bandeau de simulation    |  4,51:1 | 4,5:1 | OK      |
| `#065f46` sur `#d1fae5`, pastille de crédit       |  6,78:1 | 4,5:1 | OK      |
| `#991b1b` sur `#fee2e2`, badge « refusé »         |  6,80:1 | 4,5:1 | OK      |

Les deux échecs de texte se jouent à 0,07 et 0,26 point : assombrir
`--muted-foreground` de `#6b7280` à `#616a77` porte les deux paires au-dessus du
seuil sans toucher au reste de la palette.

## 4. Les sept critères non testés

| Critère | Ce qu'il faut pour le trancher                    |
| ------- | ------------------------------------------------- |
| 8.2     | Validateur W3C sur le HTML rendu                  |
| 10.2    | Rendu avec les feuilles de styles désactivées     |
| 10.3    | idem                                              |
| 10.4    | Zoom texte à 200 % dans un navigateur             |
| 10.11   | Fenêtre de 320 px de large et 256 px de haut      |
| 10.12   | Redéfinition des propriétés d'espacement du texte |
| 12.8    | Parcours au clavier de l'ordre de tabulation réel |

Ces sept critères, plus les vérifications de restitution sur la base de
référence (Firefox / NVDA, Safari / VoiceOver), constituent le reste à faire
pour disposer d'un audit valide au sens du RGAA.

## 5. Observations sans incidence sur le taux

Relevées pendant la lecture, elles ne font échouer aucun critère mais méritent
d'être corrigées quand le code sera touché.

- `components/composites/brand-block.tsx:3` : `aria-label="République Française"`
  posé sur un `<div>` sans rôle : ignoré par les technologies d'assistance, et
  redondant avec le texte visible.
- `components/composites/simulation-banner.tsx:5` : `role="status"` sur un
  contenu statique. Le rôle est fait pour annoncer un changement ; ici il n'y en
  a pas.
- `app/(protected)/me/history/page.client.tsx` : « Charger plus » ajoute des
  lignes sans message de statut, alors que `me/partners/page.client.tsx` montre
  le motif attendu avec son compteur en `aria-live="polite"`.
- `app/page.tsx:104,177` : deux `<nav>` sans nom accessible distinct.

## 6. Ce que le DSFR change, et ce qu'il ne change pas

`@codegouvfr/react-dsfr` est déclaré dans `apps/frontend/package.json` sur la
branche `feat/frontend/dsfr`, mais aucun composant DSFR n'était utilisé dans une
page au moment de cet audit : les écrans reposent sur shadcn/Radix et Tailwind.

Le passage au DSFR traitera par construction plusieurs des non-conformités
ci-dessus : les composants du système livrent leurs propres étiquettes, un
indicateur de focus conforme, une palette contrastée et un lien d'évitement
(`SkipLinks`). Il n'en traitera **aucune** de celles qui tiennent à la façon
dont l'application assemble ces composants : le `<div>` cliquable de la liste
des partenaires (7.1, 7.3), l'absence de plan du site (12.1), l'absence de
contrôle de saisie sur le démonstrateur (11.10) et son défaut d'`autocomplete`
(11.13) resteront après la migration.

Utiliser le DSFR ne dispense donc pas de l'audit : il déplace le taux, il ne le
détermine pas.

## 7. Grille complète des 106 critères

Verdicts : **C** conforme · **NC** non conforme · **NA** non applicable ·
**NT** non testé.

### 1. Images : 1 C · 2 NC · 6 NA · 0 NT

| Critère | Intitulé                                                                                                                                                                                             | Verdict |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1.1     | Chaque image porteuse d’information a-t-elle une alternative textuelle ?                                                                                                                             | **NC**  |
| 1.2     | Chaque image de décoration est-elle correctement ignorée par les technologies d’assistance ?                                                                                                         | **NC**  |
| 1.3     | Pour chaque image porteuse d’information ayant une alternative textuelle, cette alternative est-elle pertinente (hors cas particuliers) ?                                                            | **C**   |
| 1.4     | Pour chaque image utilisée comme CAPTCHA ou comme image-test, ayant une alternative textuelle, cette alternative permet-elle d’identifier la nature et la fonction de l’image ?                      | **NA**  |
| 1.5     | Pour chaque image utilisée comme CAPTCHA, une solution d’accès alternatif au contenu ou à la fonction du CAPTCHA est-elle présente ?                                                                 | **NA**  |
| 1.6     | Chaque image porteuse d’information a-t-elle, si nécessaire, une description détaillée ?                                                                                                             | **NA**  |
| 1.7     | Pour chaque image porteuse d’information ayant une description détaillée, cette description est-elle pertinente ?                                                                                    | **NA**  |
| 1.8     | Chaque image texte porteuse d’information, en l’absence d’un mécanisme de remplacement, doit si possible être remplacée par du texte stylé. Cette règle est-elle respectée (hors cas particuliers) ? | **NA**  |
| 1.9     | Chaque légende d’image est-elle, si nécessaire, correctement reliée à l’image correspondante ?                                                                                                       | **NA**  |

### 2. Cadres : 0 C · 0 NC · 2 NA · 0 NT

| Critère | Intitulé                                                                        | Verdict |
| ------- | ------------------------------------------------------------------------------- | ------- |
| 2.1     | Chaque cadre a-t-il un titre de cadre ?                                         | **NA**  |
| 2.2     | Pour chaque cadre ayant un titre de cadre, ce titre de cadre est-il pertinent ? | **NA**  |

### 3. Couleurs : 1 C · 2 NC · 0 NA · 0 NT

| Critère | Intitulé                                                                                                                                                                                      | Verdict |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 3.1     | Dans chaque page web, l’information ne doit pas être donnée uniquement par la couleur. Cette règle est-elle respectée ?                                                                       | **C**   |
| 3.2     | Dans chaque page web, le contraste entre la couleur du texte et la couleur de son arrière-plan est-il suffisamment élevé (hors cas particuliers) ?                                            | **NC**  |
| 3.3     | Dans chaque page web, les couleurs utilisées dans les composants d’interface ou les éléments graphiques porteurs d’informations sont-elles suffisamment contrastées (hors cas particuliers) ? | **NC**  |

### 4. Multimédia : 0 C · 0 NC · 13 NA · 0 NT

| Critère | Intitulé                                                                                                                                                                     | Verdict |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 4.1     | Chaque média temporel pré-enregistré a-t-il, si nécessaire, une transcription textuelle ou une audiodescription (hors cas particuliers) ?                                    | **NA**  |
| 4.2     | Pour chaque média temporel pré-enregistré ayant une transcription textuelle ou une audiodescription synchronisée, celles-ci sont-elles pertinentes (hors cas particuliers) ? | **NA**  |
| 4.3     | Chaque média temporel synchronisé pré-enregistré a-t-il, si nécessaire, des sous-titres synchronisés (hors cas particuliers) ?                                               | **NA**  |
| 4.4     | Pour chaque média temporel synchronisé pré-enregistré ayant des sous-titres synchronisés, ces sous-titres sont-ils pertinents ?                                              | **NA**  |
| 4.5     | Chaque média temporel pré-enregistré a-t-il, si nécessaire, une audiodescription synchronisée (hors cas particuliers) ?                                                      | **NA**  |
| 4.6     | Pour chaque média temporel pré-enregistré ayant une audiodescription synchronisée, celle-ci est-elle pertinente ?                                                            | **NA**  |
| 4.7     | Chaque média temporel est-il clairement identifiable (hors cas particuliers) ?                                                                                               | **NA**  |
| 4.8     | Chaque média non temporel a-t-il, si nécessaire, une alternative (hors cas particuliers) ?                                                                                   | **NA**  |
| 4.9     | Pour chaque média non temporel ayant une alternative, cette alternative est-elle pertinente ?                                                                                | **NA**  |
| 4.10    | Chaque son déclenché automatiquement est-il contrôlable par l’utilisateur ?                                                                                                  | **NA**  |
| 4.11    | La consultation de chaque média temporel est-elle, si nécessaire, contrôlable par le clavier et tout dispositif de pointage ?                                                | **NA**  |
| 4.12    | La consultation de chaque média non temporel est-elle contrôlable par le clavier et tout dispositif de pointage ?                                                            | **NA**  |
| 4.13    | Chaque média temporel et non temporel est-il compatible avec les technologies d’assistance (hors cas particuliers) ?                                                         | **NA**  |

### 5. Tableaux : 0 C · 0 NC · 8 NA · 0 NT

| Critère | Intitulé                                                                                                                                                   | Verdict |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 5.1     | Chaque tableau de données complexe a-t-il un résumé ?                                                                                                      | **NA**  |
| 5.2     | Pour chaque tableau de données complexe ayant un résumé, celui-ci est-il pertinent ?                                                                       | **NA**  |
| 5.3     | Pour chaque tableau de mise en forme, le contenu linéarisé reste-t-il compréhensible ?                                                                     | **NA**  |
| 5.4     | Pour chaque tableau de données ayant un titre, le titre est-il correctement associé au tableau de données ?                                                | **NA**  |
| 5.5     | Pour chaque tableau de données ayant un titre, celui-ci est-il pertinent ?                                                                                 | **NA**  |
| 5.6     | Pour chaque tableau de données, chaque en-tête de colonne et chaque en-tête de ligne sont-ils correctement déclarés ?                                      | **NA**  |
| 5.7     | Pour chaque tableau de données, la technique appropriée permettant d’associer chaque cellule avec ses en-têtes est-elle utilisée (hors cas particuliers) ? | **NA**  |
| 5.8     | Chaque tableau de mise en forme ne doit pas utiliser d’éléments propres aux tableaux de données. Cette règle est-elle respectée ?                          | **NA**  |

### 6. Liens : 2 C · 0 NC · 0 NA · 0 NT

| Critère | Intitulé                                               | Verdict |
| ------- | ------------------------------------------------------ | ------- |
| 6.1     | Chaque lien est-il explicite (hors cas particuliers) ? | **C**   |
| 6.2     | Dans chaque page web, chaque lien a-t-il un intitulé ? | **C**   |

### 7. Scripts : 2 C · 2 NC · 1 NA · 0 NT

| Critère | Intitulé                                                                                                         | Verdict |
| ------- | ---------------------------------------------------------------------------------------------------------------- | ------- |
| 7.1     | Chaque script est-il, si nécessaire, compatible avec les technologies d’assistance ?                             | **NC**  |
| 7.2     | Pour chaque script ayant une alternative, cette alternative est-elle pertinente ?                                | **NA**  |
| 7.3     | Chaque script est-il contrôlable par le clavier et par tout dispositif de pointage (hors cas particuliers) ?     | **NC**  |
| 7.4     | Pour chaque script qui initie un changement de contexte, l’utilisateur est-il averti ou en a-t-il le contrôle ?  | **C**   |
| 7.5     | Dans chaque page web, les messages de statut sont-ils correctement restitués par les technologies d’assistance ? | **C**   |

### 8. Éléments obligatoires : 6 C · 0 NC · 3 NA · 1 NT

| Critère | Intitulé                                                                                                                                | Verdict |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 8.1     | Chaque page web est-elle définie par un type de document ?                                                                              | **C**   |
| 8.2     | Pour chaque page web, le code source généré est-il valide selon le type de document spécifié ?                                          | **NT**  |
| 8.3     | Dans chaque page web, la langue par défaut est-elle présente ?                                                                          | **C**   |
| 8.4     | Pour chaque page web ayant une langue par défaut, le code de langue est-il pertinent ?                                                  | **C**   |
| 8.5     | Chaque page web a-t-elle un titre de page ?                                                                                             | **C**   |
| 8.6     | Pour chaque page web ayant un titre de page, ce titre est-il pertinent ?                                                                | **C**   |
| 8.7     | Dans chaque page web, chaque changement de langue est-il indiqué dans le code source (hors cas particuliers) ?                          | **NA**  |
| 8.8     | Dans chaque page web, le code de langue de chaque changement de langue est-il valide et pertinent ?                                     | **NA**  |
| 8.9     | Dans chaque page web, les balises ne doivent pas être utilisées uniquement à des fins de présentation. Cette règle est-elle respectée ? | **C**   |
| 8.10    | Dans chaque page web, les changements du sens de lecture sont-ils signalés ?                                                            | **NA**  |

### 9. Structuration de l’information : 3 C · 0 NC · 1 NA · 0 NT

| Critère | Intitulé                                                                                         | Verdict |
| ------- | ------------------------------------------------------------------------------------------------ | ------- |
| 9.1     | Dans chaque page web, l’information est-elle structurée par l’utilisation appropriée de titres ? | **C**   |
| 9.2     | Dans chaque page web, la structure du document est-elle cohérente (hors cas particuliers) ?      | **C**   |
| 9.3     | Dans chaque page web, chaque liste est-elle correctement structurée ?                            | **C**   |
| 9.4     | Dans chaque page web, chaque citation est-elle correctement indiquée ?                           | **NA**  |

### 10. Présentation de l’information : 4 C · 2 NC · 3 NA · 5 NT

| Critère | Intitulé                                                                                                                                                                                                                                                  | Verdict |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 10.1    | Dans le site web, des feuilles de styles sont-elles utilisées pour contrôler la présentation de l’information ?                                                                                                                                           | **C**   |
| 10.2    | Dans chaque page web, le contenu visible porteur d’information reste-t-il présent lorsque les feuilles de styles sont désactivées ?                                                                                                                       | **NT**  |
| 10.3    | Dans chaque page web, l’information reste-t-elle compréhensible lorsque les feuilles de styles sont désactivées ?                                                                                                                                         | **NT**  |
| 10.4    | Dans chaque page web, le texte reste-t-il lisible lorsque la taille des caractères est augmentée jusqu’à 200%, au moins (hors cas particuliers) ?                                                                                                         | **NT**  |
| 10.5    | Dans chaque page web, les déclarations CSS de couleurs de fond d’élément et de police sont-elles correctement utilisées ?                                                                                                                                 | **C**   |
| 10.6    | Dans chaque page web, chaque lien dont la nature n’est pas évidente est-il visible par rapport au texte environnant ?                                                                                                                                     | **NC**  |
| 10.7    | Dans chaque page web, pour chaque élément recevant le focus, la prise de focus est-elle visible ?                                                                                                                                                         | **NC**  |
| 10.8    | Pour chaque page web, les contenus cachés ont-ils vocation à être ignorés par les technologies d’assistance ?                                                                                                                                             | **C**   |
| 10.9    | Dans chaque page web, l’information ne doit pas être donnée uniquement par la forme, taille ou position. Cette règle est-elle respectée ?                                                                                                                 | **C**   |
| 10.10   | Dans chaque page web, l’information ne doit pas être donnée par la forme, taille ou position uniquement. Cette règle est-elle implémentée de façon pertinente ?                                                                                           | **NA**  |
| 10.11   | Pour chaque page web, les contenus peuvent-ils être présentés sans avoir recours à un défilement vertical pour une fenêtre ayant une hauteur de 256px ou à un défilement horizontal pour une fenêtre ayant une largeur de 320px (hors cas particuliers) ? | **NT**  |
| 10.12   | Dans chaque page web, les propriétés d’espacement du texte peuvent-elles être redéfinies par l’utilisateur sans perte de contenu ou de fonctionnalité (hors cas particuliers) ?                                                                           | **NT**  |
| 10.13   | Dans chaque page web, les contenus additionnels apparaissant à la prise de focus ou au survol d’un composant d’interface sont-ils contrôlables par l’utilisateur (hors cas particuliers) ?                                                                | **NA**  |
| 10.14   | Dans chaque page web, les contenus additionnels apparaissant via les styles CSS uniquement peuvent-ils être rendus visibles au clavier et par tout dispositif de pointage ?                                                                               | **NA**  |

### 11. Formulaires : 5 C · 3 NC · 5 NA · 0 NT

| Critère | Intitulé                                                                                                                                                                                                                                                                                | Verdict |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 11.1    | Chaque champ de formulaire a-t-il une étiquette ?                                                                                                                                                                                                                                       | **NC**  |
| 11.2    | Chaque étiquette associée à un champ de formulaire est-elle pertinente (hors cas particuliers) ?                                                                                                                                                                                        | **C**   |
| 11.3    | Dans chaque formulaire, chaque étiquette associée à un champ de formulaire ayant la même fonction et répétée plusieurs fois dans une même page ou dans un ensemble de pages est-elle cohérente ?                                                                                        | **C**   |
| 11.4    | Dans chaque formulaire, chaque étiquette de champ et son champ associé sont-ils accolés (hors cas particuliers) ?                                                                                                                                                                       | **C**   |
| 11.5    | Dans chaque formulaire, les champs de même nature sont-ils regroupés, si nécessaire ?                                                                                                                                                                                                   | **NA**  |
| 11.6    | Dans chaque formulaire, chaque regroupement de champs de même nature a-t-il une légende ?                                                                                                                                                                                               | **NA**  |
| 11.7    | Dans chaque formulaire, chaque légende associée à un regroupement de champs de même nature est-elle pertinente ?                                                                                                                                                                        | **NA**  |
| 11.8    | Dans chaque formulaire, les items de même nature d’une liste de choix sont-ils regroupés de manière pertinente ?                                                                                                                                                                        | **NA**  |
| 11.9    | Dans chaque formulaire, l’intitulé de chaque bouton est-il pertinent (hors cas particuliers) ?                                                                                                                                                                                          | **C**   |
| 11.10   | Dans chaque formulaire, le contrôle de saisie est-il utilisé de manière pertinente (hors cas particuliers) ?                                                                                                                                                                            | **NC**  |
| 11.11   | Dans chaque formulaire, le contrôle de saisie est-il accompagné, si nécessaire, de suggestions facilitant la correction des erreurs de saisie ?                                                                                                                                         | **C**   |
| 11.12   | Pour chaque formulaire qui modifie ou supprime des données, ou qui transmet des réponses à un test ou à un examen, ou dont la validation a des conséquences financières ou juridiques, les données saisies peuvent-elles être modifiées, mises à jour ou récupérées par l’utilisateur ? | **NA**  |
| 11.13   | La finalité d’un champ de saisie peut-elle être déduite pour faciliter le remplissage automatique des champs avec les données de l’utilisateur ?                                                                                                                                        | **NC**  |

### 12. Navigation : 3 C · 2 NC · 5 NA · 1 NT

| Critère | Intitulé                                                                                                                                                                                                                        | Verdict |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 12.1    | Chaque ensemble de pages dispose-t-il de deux systèmes de navigation différents, au moins (hors cas particuliers) ?                                                                                                             | **NC**  |
| 12.2    | Dans chaque ensemble de pages, le menu et les barres de navigation sont-ils toujours à la même place (hors cas particuliers) ?                                                                                                  | **C**   |
| 12.3    | La page « plan du site » est-elle pertinente ?                                                                                                                                                                                  | **NA**  |
| 12.4    | Dans chaque ensemble de pages, la page « plan du site » est-elle accessible à partir d’une fonctionnalité identique ?                                                                                                           | **NA**  |
| 12.5    | Dans chaque ensemble de pages, le moteur de recherche est-il atteignable de manière identique ?                                                                                                                                 | **NA**  |
| 12.6    | Les zones de regroupement de contenus présentes dans plusieurs pages web (zones d’en-tête, de navigation principale, de contenu principal, de pied de page et de moteur de recherche) peuvent-elles être atteintes ou évitées ? | **C**   |
| 12.7    | Dans chaque page web, un lien d’évitement ou d’accès rapide à la zone de contenu principal est-il présent (hors cas particuliers) ?                                                                                             | **NC**  |
| 12.8    | Dans chaque page web, l’ordre de tabulation est-il cohérent ?                                                                                                                                                                   | **NT**  |
| 12.9    | Dans chaque page web, la navigation ne doit pas contenir de piège au clavier. Cette règle est-elle respectée ?                                                                                                                  | **C**   |
| 12.10   | Dans chaque page web, les raccourcis clavier n’utilisant qu’une seule touche (lettre minuscule ou majuscule, ponctuation, chiffre ou symbole) sont-ils contrôlables par l’utilisateur ?                                         | **NA**  |
| 12.11   | Dans chaque page web, les contenus additionnels apparaissant au survol, à la prise de focus ou à l’activation d’un composant d’interface sont-ils si nécessaire atteignables au clavier ?                                       | **NA**  |

### 13. Consultation : 8 C · 0 NC · 4 NA · 0 NT

| Critère | Intitulé                                                                                                                                                                                        | Verdict |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 13.1    | Pour chaque page web, l’utilisateur a-t-il le contrôle de chaque limite de temps modifiant le contenu (hors cas particuliers) ?                                                                 | **NA**  |
| 13.2    | Dans chaque page web, l’ouverture d’une nouvelle fenêtre ne doit pas être déclenchée sans action de l’utilisateur. Cette règle est-elle respectée ?                                             | **C**   |
| 13.3    | Dans chaque page web, chaque document bureautique en téléchargement possède-t-il, si nécessaire, une version accessible (hors cas particuliers) ?                                               | **NA**  |
| 13.4    | Pour chaque document bureautique ayant une version accessible, cette version offre-t-elle la même information ?                                                                                 | **NA**  |
| 13.5    | Dans chaque page web, chaque contenu cryptique (art ASCII, émoticône, syntaxe cryptique) a-t-il une alternative ?                                                                               | **C**   |
| 13.6    | Dans chaque page web, pour chaque contenu cryptique (art ASCII, émoticône, syntaxe cryptique) ayant une alternative, cette alternative est-elle pertinente ?                                    | **NA**  |
| 13.7    | Dans chaque page web, les changements brusques de luminosité ou les effets de flash sont-ils correctement utilisés ?                                                                            | **C**   |
| 13.8    | Dans chaque page web, chaque contenu en mouvement ou clignotant est-il contrôlable par l’utilisateur ?                                                                                          | **C**   |
| 13.9    | Dans chaque page web, le contenu proposé est-il consultable quelle que soit l’orientation de l’écran (portrait ou paysage) (hors cas particuliers) ?                                            | **C**   |
| 13.10   | Dans chaque page web, les fonctionnalités utilisables ou disponibles au moyen d’un geste complexe peuvent-elles être également disponibles au moyen d’un geste simple (hors cas particuliers) ? | **C**   |
| 13.11   | Dans chaque page web, les actions déclenchées au moyen d’un dispositif de pointage sur un point unique de l’écran peuvent-elles faire l’objet d’une annulation (hors cas particuliers) ?        | **C**   |
| 13.12   | Dans chaque page web, les fonctionnalités qui impliquent un mouvement de l’appareil ou vers l’appareil peuvent-elles être satisfaites de manière alternative (hors cas particuliers) ?          | **C**   |

---

## Sources

- RGAA 4.1, critères et tests : <https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/>
- RGAA 4.1, grille des 106 critères (`RGAA/4.1/criteres.json`) : <https://github.com/DISIC/accessibilite.numerique.gouv.fr>
- RGAA 4.1, évaluation de la conformité : <https://accessibilite.numerique.gouv.fr/obligations/evaluation-conformite/>
- WCAG 2.1, rapport de contraste : <https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio>
- `@codegouvfr/react-dsfr` : <https://github.com/codegouvfr/react-dsfr>
