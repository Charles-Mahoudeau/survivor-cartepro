# RULE : Charger le skill de CHAQUE type d'artefact que le changement produit — pas seulement celui de sa nature dominante

## Contexte

Chantier abondements (PR #61). Le changement produisait deux sortes d'artefacts : un
module backend (entités, repo, service, controller, docs Swagger) **et** des tests
d'intégration avec leurs fixtures.

J'ai chargé `architecture-module-conventions` et j'ai écrit les deux. Je n'ai jamais
chargé `write-integration-tests`, alors que le `CLAUDE.md` du projet le prescrit noir sur
blanc :

| Situation                  | À appliquer                                          |
| -------------------------- | ---------------------------------------------------- |
| Créer / modifier un module | skill `architecture-module-conventions`              |
| Écrire un test             | skills `write-unit-tests`, `write-integration-tests` |

Pire : le skill que j'avais chargé le disait lui-même, dans sa section `<scope>` — « Écriture
d'un test d'intégration → déléguer au skill de tests d'intégration du projet s'il existe ».
Je l'ai lu et je ne l'ai pas suivi.

Conséquence, en trois temps :

1. Les fixtures sont écrites **dans** les fichiers de spec. Un relecteur humain le
   demande en revue : « déplace les fixtures dans un autre fichier ».
2. Je les déplace — en déduisant la forme des fichiers voisins plutôt que du skill. Le
   résultat est une classe fourre-tout qui mélange l'entité, le compte agent, l'employeur,
   les portefeuilles et deux helpers d'assertion.
3. L'utilisateur doit intervenir une seconde fois pour dire qu'un skill existe et qu'il
   impose l'emplacement et la forme. Le skill dit : **une fixture par entité**, classe
   statique, `create(dataSource, …fkIds, overrides)`, voisine du spec.

Deux allers-retours humains pour une convention entièrement écrite quelque part.

## Erreur commise

Avoir choisi le skill à charger d'après la **nature dominante** de la tâche (« je crée un
module ») au lieu de l'avoir choisi d'après **chaque type de fichier que le changement
produit**. Un changement qui écrit un `*.service.ts` et un `*.integration.spec.ts` relève
de deux skills, pas d'un.

Aggravant : le skill chargé renvoyait explicitement vers l'autre. Un renvoi lu et non
suivi est pire qu'un renvoi absent — j'avais l'information sous les yeux.

Second aggravant : privé du skill, j'ai dérivé la convention des fichiers voisins. C'est
exactement la faute de `fix-raisonnement-convention-derivee-d-un-seul-echantillon.md`,
transposée d'un échantillon d'issues à un échantillon de fixtures.

## Cause racine

Un skill est indexé par **artefact**, pas par intention. « Je fais une feature » n'est pas
une entrée de la table du `CLAUDE.md` ; « écrire un test » en est une. Tant qu'on choisit
le skill à partir de l'intention, on n'en charge qu'un — celui qui décrit le morceau le
plus visible — et tous les autres artefacts sont écrits à l'instinct.

Et l'instinct produit du code qui **passe les gates** : typecheck vert, lint vert, tests
verts. Rien dans l'outillage ne signale une fixture au mauvais endroit ou de la mauvaise
forme. Seul un humain le voit, en revue, une fois le travail terminé.

## Règle à appliquer

1. **Avant d'écrire le premier fichier, lister les types d'artefacts que le changement va
   produire** (module, entité, migration, test unitaire, test d'intégration, fixture, doc
   Swagger, script, règle) et **charger le skill de chacun**. La table du `CLAUDE.md` est
   la table de correspondance ; elle se lit en entier, pas jusqu'à la première ligne qui
   correspond.
2. **Un skill qui renvoie vers un autre skill est une instruction, pas une note.** Quand un
   skill chargé dit « pour Y, voir le skill Z », charger Z **avant** d'écrire du Y. Ne
   jamais se dire qu'on connaît déjà la convention.
3. **Ne jamais déduire d'un fichier voisin une convention qu'un skill gouverne.** Le
   voisin peut être ancien, être une variante, ou être lui-même hors convention. Le skill
   fait autorité ; les voisins servent à vérifier qu'on l'a bien compris (et à au moins
   trois exemplaires, cf.
   `fix-raisonnement-convention-derivee-d-un-seul-echantillon.md`).
4. **Une remarque de revue sur la FORME d'un fichier est le symptôme d'un skill sauté.**
   Avant de corriger, aller chercher le skill qui gouverne ce type de fichier et appliquer
   sa règle — pas la reformulation la plus courte qui fasse taire le commentaire. J'ai
   perdu un aller-retour en corrigeant sans être allé lire.
5. **Le vert des gates ne dit rien de la conformité.** Typecheck, lint et tests ne voient
   ni l'emplacement d'un fichier, ni la forme d'une classe, ni le découpage d'une fixture.
   Ne jamais conclure « c'est bon » sur leur seule foi quand un skill gouverne l'artefact.

## Exemple

- ❌ **Avant (incorrect)** : la tâche crée un module et ses tests. Je charge
  `architecture-module-conventions`, j'écris le module, puis j'écris les specs et leurs
  fixtures à l'instinct. Les fixtures finissent dans les specs, puis dans une classe
  fourre-tout. Deux corrections demandées par des humains.
- ✅ **Après (correct)** : la tâche produit un module **et** des tests d'intégration →
  je charge `architecture-module-conventions` **et** `write-integration-tests` avant
  d'écrire quoi que ce soit. Les fixtures naissent au bon endroit, une par entité, à la
  forme `create(dataSource, …fkIds, overrides)`, sans qu'aucune revue n'ait à le demander.
