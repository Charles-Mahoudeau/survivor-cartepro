# RULE : Commits Conventional Commits stricts et scopes valides

## Objectif

À chaque fois que l'agent veut créer un commit, il doit produire un message **strictement conforme** à Conventional Commits **et** utiliser un **scope valide, précis et justifié par les fichiers réellement modifiés**.

Cette règle est **obligatoire**. Si le message ne respecte pas ce format, l'agent **ne doit pas commit** tant qu'il n'a pas corrigé le message.

## Format obligatoire

Le header du commit doit toujours respecter exactement ce format :

```text
<type>(<scope>): <description>
```

Le `scope` est **obligatoire dès que le changement tient dans une application ou un
domaine** — c'est-à-dire dans la quasi-totalité des cas. Il n'est omis que pour un
changement réellement transverse au dépôt entier (`chore: initialize repository`,
`docs: …` sur le README racine).

Exemple attendu :

```text
feat(auth): add email and password sign-up flow
```

## Types autorisés

Les types autorisés doivent rester alignés avec `commitlint.config.ts` :

- `feat`
- `fix`
- `critical`
- `docs`
- `style`
- `refactor`
- `perf`
- `test`
- `build`
- `ci`
- `chore`
- `revert`

L'agent ne doit pas inventer d'autre type.

## Règles strictes sur le scope

Le `scope` doit respecter **toutes** les contraintes suivantes :

1. Il est présent dès que le changement tient dans une application ou un domaine.
2. Il est en minuscules.
3. C'est un nom court et stable de domaine, module, couche technique ou zone du dépôt.
4. Il correspond à la zone principale réellement modifiée.
5. Il n'est ni vague ni passe-partout.
6. Ce n'est pas le nom d'un fichier isolé, sauf si ce fichier constitue à lui seul un
   sous-système reconnu.

## Scopes valides par défaut

Cette liste est **dérivée de l'arborescence réelle du dépôt et de son historique**
(`git log`), pas importée d'ailleurs. Elle évolue avec le code : un module qui naît
apporte son scope.

**Applications** — le dépôt est un monorepo Bun/Turbo, donc l'application est un scope
légitime quand le changement est transverse à elle (`apps/backend`, `apps/frontend`) :

- `backend`
- `frontend`

**Domaines métier** (un module de `apps/backend/src/modules/`, un domaine du front) :

- `health`
- `auth`

**Couches et zones techniques** :

- `database`
- `migration`
- `config`
- `swagger`
- `logging`
- `scripts`
- `docker`
- `ci`
- `build`
- `deps`
- `docs`
- `test`
- `tooling` — outillage d'agent (`.claude/`), hooks, lint-staged

Un scope hors de cette liste est autorisé **uniquement** s'il est plus précis,
réellement ancré dans le codebase, et qu'il désigne un sous-domaine existant. Un module
nouvellement créé donne son nom au scope (`partner`, `transaction`, `benefit`…).

Exemples interdits :

- `misc`
- `stuff`
- `various`
- `update`
- `changes`
- `project`
- `tmp`
- `apps`

## Comment choisir le scope

Avant chaque commit, l'agent doit déterminer le scope avec cette logique :

1. Identifier les fichiers réellement inclus dans le commit.
2. Trouver le plus petit domaine stable commun à ces fichiers. Un changement qui ne
   touche qu'un module prend le nom du module, pas celui de l'application.
3. Si plusieurs domaines non liés sont mélangés, **ne pas forcer un scope large** :
   scinder en plusieurs commits.
4. Si les changements sont transverses mais ciblent un système technique clair, utiliser
   le scope technique le plus précis : `database`, `ci`, `build`, `config`, `deps`.
5. Si aucun scope précis et défendable n'existe et que le changement porte réellement sur
   le dépôt entier, commiter sans scope plutôt qu'avec un faux scope.

## Règles sur la description

La description doit respecter ces contraintes :

1. Décrire l'effet principal du commit, pas la liste complète des fichiers.
2. Être courte, concrète, lisible et orientée résultat.
3. Ne pas finir par un point.
4. Ne pas commencer en `Start Case`, `PascalCase` ou `UPPER CASE`.
5. Rester cohérente avec le type choisi.
6. Inclure le nom de la tâche, de la phase ou de l'ID si ce contexte existe déjà, sans en inventer un.

Exemples :

- `fix(database): prevent duplicate session rows`
- `refactor(auth): move the role check into a shared guard`
- `test(health): cover the probe response shape`

## Breaking changes

Pour un breaking change, l'agent peut utiliser `!` dans le header, mais doit aussi ajouter une ligne explicite :

```text
BREAKING CHANGE: <explication>
```

Exemple :

```text
feat(auth)!: replace the bearer token with a session cookie

BREAKING CHANGE: clients no longer send Authorization: Bearer and must carry the session cookie instead
```

## Vérification obligatoire avant commit

Juste avant de commit, l'agent doit vérifier explicitement :

1. que le type fait partie de la liste autorisée ;
2. que le scope est présent ;
3. que le scope correspond réellement aux fichiers du commit ;
4. que le scope n'est ni vague ni artificiel ;
5. que la description respecte le style Conventional Commits ;
6. que le message reste compatible avec `commitlint.config.ts`.

## Exemples à suivre

Correct :

```text
feat(auth): add role guard on administration routes
fix(database): prevent duplicate session rows on refresh
docs(backend): clarify the migration workflow
build(deps): bump better-auth to fix cookie expiry
test(logging): cover the redaction denylist on nested keys
```

Incorrect :

```text
fix(misc): stuff
Update auth system
chore(project): various changes
refactor(tmp): cleanup files
feat(apps): add stuff to the backend
```

## Instruction opérationnelle

Quand l'agent veut commit, il doit appliquer cette règle comme une contrainte de blocage :

- pas de commit sans scope dès que le changement tient dans une zone identifiable ;
- pas de commit avec un scope vague ;
- pas de commit qui mélange plusieurs domaines sans découpage propre ;
- pas de commit avec un message qui ne passerait pas une revue Conventional Commits stricte.

En cas de doute, l'agent doit d'abord réorganiser les changements ou reformuler le message, puis seulement commit.
