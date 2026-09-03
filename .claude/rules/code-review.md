# RULE : Revue de code — critères, sévérités et procédure de lancement

## Objectif

Quand l'utilisateur demande une **review** (« lance une review », « review cette PR »,
« fais reviewer ça »), l'agent applique **cette rule intégralement**. Elle définit ce
qu'on cherche, comment on le classe, ce qu'on a le droit de rapporter, et comment la
review est déléguée.

Une review qui ne suit pas cette rule n'est pas une review : c'est une lecture.

---

## 1. Procédure de lancement

1. **Déléguer à un sous-agent `Sonnet 5`** (`model: sonnet`), jamais faire la review
   soi-même dans le contexte principal. Raison : la review doit être faite par un
   lecteur qui n'a PAS écrit le code et qui n'a pas le biais de l'intention.
2. **Le brief de l'agent doit contenir**, explicitement :
   - le **diff exact** à reviewer (commande `git diff <base>...HEAD` ou la liste de fichiers) ;
   - le **contexte fonctionnel** (ce que la PR est censée faire, et pourquoi) ;
   - le **chemin de cette rule** + les `.claude/rules/` pertinentes au diff ;
   - les **gates déjà passés** (typecheck / lint / test / build) avec leur sortie réelle ;
   - l'ordre explicite de **vérifier chaque finding dans le code avant de le rapporter**.
3. **Ne jamais donner à l'agent un invariant « à asserter » qu'on n'a pas mesuré soi-même**
   (cf. `fix-raisonnement-invariant-delegue-doit-etre-calcule.md`). On lui demande de
   dériver et mesurer, pas de confirmer une hypothèse.
4. **Plusieurs agents en parallèle** si le diff couvre des domaines disjoints (ex. un pour
   la couche données/migrations, un pour la sécurité, un pour les tests). Un seul agent
   pour un diff cohérent.
5. Le rapport revient à l'utilisateur **avec les findings, pas avec un résumé du diff**.

---

## 2. Sévérités (taxonomie obligatoire)

Tout finding porte **exactement une** sévérité :

| Sévérité     | Définition                                                | Exemples                                                                                                        |
| ------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Critical** | Vulnérabilité, perte de données, crash, corruption d'état | IDOR, injection SQL, secret en dur, migration destructive non voulue, race qui corrompt un compteur             |
| **Warning**  | Bug, régression de perf, anti-pattern structurel          | Off-by-one, N+1, gate de sécurité placé dans le controller au lieu du service, violation d'une `.claude/rules/` |
| **Info**     | Style, lisibilité, suggestion mineure                     | Nommage perfectible, commentaire superflu, simplification possible                                              |

**Règle de tri** : dans le doute entre deux niveaux, on prend **le plus bas**. Un
`Critical` qui n'en est pas un détruit la confiance dans tous les autres.

---

## 3. Ce qu'on cherche — dimensions génériques

Dans cet ordre d'importance (adapté de Google eng-practices) :

1. **Design** — les interactions entre les morceaux ont-elles du sens ? Le code est-il au
   bon endroit (bon module, bonne couche) ? Est-ce le bon moment pour l'ajouter ?
2. **Fonctionnalité** — le code fait-il ce que l'auteur voulait ? Ce comportement est-il
   bon pour l'utilisateur final ? Cas limites, concurrence, erreurs non gérées.
3. **Complexité** — peut-on faire plus simple ? Un autre dev comprendra-t-il vite ?
   **Sur-ingénierie** = un finding : du code qui résout un problème spéculatif futur
   plutôt que le besoin actuel.
4. **Tests** — les tests existent-ils, et **échoueraient-ils vraiment** si le code cassait ?
   Assertions utiles et simples ? Couverture des cas limites, pas seulement du chemin nominal.
   Trois pièges à chercher activement (`fix-process-test-vert-qui-verrouille-un-defaut-et-fake-trop-deterministe.md`) :
   une assertion qui décrit la **sortie observée** ou une **forme interne** (préfixe de
   signature, structure de clé) au lieu d'un fait utilisateur — elle verrouille le défaut ;
   une assertion **symétrique** qu'une régression dans un sens comme dans l'autre laisserait
   verte ; et une assertion portée par un chemin qui ne peut **structurellement** jamais
   porter la valeur testée. Vérifier aussi que les **fakes** conservent les propriétés
   risquées du réel (variabilité, échec, avance de l'horloge) : un double plus sage que la
   dépendance rend une classe entière de bugs invisible à toute la suite.
5. **Nommage** — les noms disent-ils ce que la chose est ? (cf.
   `fix-format-naming-donnees-pas-processus.md`)
6. **Commentaires** — expliquent-ils le _pourquoi_ non-évident, pas le _quoi_ ?
7. **Style / cohérence** — conforme au style du repo et aux conventions voisines.
8. **Documentation** — Swagger, README, `.context/context.md` mis à jour si le comportement change.
9. **Chaque ligne** — le diff se lit intégralement. Si une ligne n'est pas comprise, on
   le dit au lieu de la survoler.
10. **Contexte** — lire autour du diff. Le changement améliore-t-il ou dégrade-t-il la
    santé globale du code ?
11. **Réutilisabilité** — le diff invente-t-il une forme, un helper ou une route dont
    l'équivalent existe déjà ? Chercher avant de conclure : un endpoint d'hydratation par
    lots, un prédicat d'admission partagé, une méthode de résolution groupée. Un concept qui
    acquiert une deuxième forme est un finding, même si les deux formes sont correctes —
    c'est ainsi qu'un système finit avec cinq façons de nommer une personne.
12. **Coût de lecture** — pour tout chemin de lecture touché : combien de requêtes en
    fonction de N ? Y a-t-il un `await` par ligne ? Une relecture de ce qu'une jointure
    tient déjà ? Deux chemins servant la même donnée à des coûts très différents ?
13. **Ce que le client devra inventer** — un payload qui omet ce que le serveur détient
    (prénom, arête de follow, identité d'un auteur, compteur) force le client à le
    synthétiser, et il le synthétise faux. Lire les DTO du client quand ils sont
    accessibles : un champ décodé que rien ne remplit, un `?? false`, un repli littéral,
    un `.split()` sur un pseudo — chacun est la trace d'un champ manquant côté serveur.

---

## 4. Ce qu'on cherche — sécurité (systématique)

- **IDOR / autorisation** : chaque lecture et écriture est-elle scopée à l'acteur ? Un
  « not found » et un « pas le tien » renvoient-ils le **même** message ?
- **Injection** : tout input utilisateur qui atteint une requête est-il **paramétré** ?
- **Secrets** : aucune clé, token, URL de service en dur (cf.
  `fix-architecture-urls-et-valeurs-magiques-en-constantes.md`).
- **Validation d'entrée** : DTO + `class-validator` sur toute donnée entrante ; bornes sur
  les tailles, les listes, la pagination.
- **Fuite de données** : le DTO de réponse expose-t-il un champ qu'il ne devrait pas
  (`@Exclude`, adresse exacte, PII dans les logs) ?
- **Routes publiques** : tout `@Public()` est-il justifié ?
- **Données personnelles** : toute collecte nominative a-t-elle une rétention bornée et une
  base légale identifiée ?

---

## 5. Ce qu'on cherche — gates spécifiques à ce repo

**Violation d'une de ces règles = `Warning` minimum, `Critical` si l'impact est en prod.**

Cette table est dérivée du code réel de ce dépôt (`apps/backend/README.md`,
`src/main.ts`, `src/config/`, `.github/workflows/ci.yml`) et des `.claude/rules/`
présentes. Elle se met à jour quand le dépôt change, jamais par recopie d'un autre projet.

### Données et migrations

| Gate                                                                                                                                                            | Règle source                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Aucun DDL de schéma écrit/édité à la main ; migrations via `bun run db:generate` uniquement                                                                     | `fix-process-migrations-via-db-generate.md`                       |
| Aucun `synchronize` réintroduit, ni variable d'environnement qui le rallumerait — le cahier des charges impose des transactions validées non modifiables (§3.2) | `apps/backend/README.md`, `src/config/database/data-source.ts`    |
| Aucun SQL brut (`dataSource.query` / `manager.query`) — QueryBuilder, et **dans un repo**                                                                       | `fix-architecture-orm-query-builder-pas-de-sql-brut.md`           |
| Les repos sont la **seule** couche qui touche l'ORM ; aucun service ne manipule `Repository<Entity>`                                                            | `architecture-module-conventions`                                 |
| Aucun import du repo d'un autre module ; on dépend des **services exportés**                                                                                    | `architecture-module-conventions`                                 |
| Clé primaire UUIDv7 (`uuidv7()`, natif en Postgres 18) — jamais un compteur séquentiel exposé                                                                   | `apps/backend/README.md`                                          |
| Aucun `@Column({ name })` manuel pour du camelCase → snake_case : `SnakeNamingStrategy` le fait                                                                 | `src/config/database/snake-naming.strategy.ts`                    |
| Le nom d'une table se lit dans `@Entity('…')` / le DDL, jamais déduit du nom de classe                                                                          | `fix-raisonnement-nom-de-table-lire-decorateur-entity.md`         |
| Avant de juger une migration redondante, tracer le cycle de vie complet de la colonne sur **toutes** les migrations                                             | `fix-process-cycle-de-vie-colonne-avant-suppression-migration.md` |

### Sérialisation, logs et configuration

| Gate                                                                                                                                                                                                                                    | Règle source                                                 |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `ClassSerializerInterceptor` est global : `@Exclude()` ne filtre que de **vraies instances de classe**. Un objet brut (`getRawMany()`, littéral) passe au travers — un hash de mot de passe qui atteint le client est une ligne d'écart | `src/main.ts`, `apps/backend/README.md`                      |
| Aucun corps de réponse loggé ; l'URL loggée est le **chemin seul**, jamais la query string brute qui réafficherait ce que la denylist vient de masquer                                                                                  | `src/common/interceptors/logging.interceptor.ts`             |
| Toute donnée sensible nouvellement introduite entre dans la denylist (`src/common/constants/logging.constants.ts`), avec un matching **exact sur la clé normalisée**, jamais en sous-chaîne                                             | idem                                                         |
| Toute variable d'environnement lue est déclarée et validée dans `src/config/env/env.schema.ts` (Zod), et documentée dans `.env.example`                                                                                                 | `src/config/env/env.schema.ts`                               |
| Config **métier** en constantes typées dans `<module>/constants/`, jamais en env                                                                                                                                                        | `fix-architecture-config-metier-constantes-pas-env.md`       |
| Zéro magic number / magic string / URL de base inline                                                                                                                                                                                   | `fix-architecture-urls-et-valeurs-magiques-en-constantes.md` |

### Contrat d'API et chemins de lecture

| Gate                                                                                                                                                                                                                      | Règle source                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Swagger obligatoire dès qu'il y a un controller (`docs/commons/` + `docs/endpoints/`, un fichier par code d'erreur remontable)                                                                                            | `architecture-module-conventions`                                           |
| DTO + `class-validator` sur toute donnée entrante ; le `ValidationPipe` global est en `whitelist: true`, donc un champ non décoré est **silencieusement supprimé** — l'absence de décorateur est un défaut, pas un détail | `src/main.ts`                                                               |
| Un DTO élargi ⇒ **toutes** les routes qui le servent sont ré-auditées, garde d'accès lue dans le service. Le grep part du nom de la classe, pas de la feature                                                             | `fix-architecture-elargir-une-projection-reaudite-toutes-ses-routes.md`     |
| Une facette d'une ressource (`/x/:id/facette`) applique **la même garde** que la ressource, via une garde partagée appelée — jamais des assertions recopiées                                                              | idem                                                                        |
| Un trou d'accès connu sur une route que le diff rend plus bavarde entre dans le diff, jamais dans un ticket                                                                                                               | idem                                                                        |
| La forme d'un payload se décide par la **règle d'accès** de ce qu'il porte, jamais par l'écran qui le consomme                                                                                                            | `fix-architecture-forme-payload-regle-acces-pas-ecran.md`                   |
| Aucune sous-ressource ayant sa **propre règle d'accès** n'est inlinée dans le payload d'une autre                                                                                                                         | idem                                                                        |
| Deux publics aux droits différents sur une même route reçoivent **deux blocs nommés distincts**, jamais une liste aux champs optionnels                                                                                   | idem                                                                        |
| Aucun `await` vers un service/repo dans un `map` ou une boucle de projection — toute résolution transverse est **batchée sur la réponse entière**                                                                         | `fix-architecture-cout-dun-chemin-de-lecture-se-compte-en-fonction-de-N.md` |
| Aucune relecture par id d'une entité qu'une jointure a déjà chargée (attention : une colonne `@RelationId` est peuplée même quand la relation ne l'est pas)                                                               | idem                                                                        |
| Le coût d'un chemin de lecture touché par le diff est **compté en fonction de N** et annoncé dans la PR                                                                                                                   | idem                                                                        |

### Forme du dépôt et du diff

| Gate                                                                                                              | Règle source                                               |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Nommage `<entity>.xxx.ts` d'après la **donnée**, jamais d'après un processus                                      | `fix-format-naming-donnees-pas-processus.md`               |
| Commentaires **en anglais**, minimaux dans les fonctions, **zéro référence à un ticket / une US / un plan**       | `fix-format-commentaires-anglais-minimal-sans-tickets.md`  |
| Noms de tests = comportement, sans suffixe de ticket                                                              | idem                                                       |
| Commits Conventional Commits avec scope valide ; **aucun trailer `Co-Authored-By`** ni mention d'IA               | `commit.md`, `fix-process-pas-de-co-author-commit.md`      |
| Toute dépendance externe importée est **déclarée dans le `package.json` du workspace qui l'importe**              | `fix-execution-worktree-node-modules-remonte-au-parent.md` |
| Une incohérence pré-existante **touchée** par le diff est traitée ou signalée, jamais étendue en silence          | `fix-process-rework-incoherences-preexistantes.md`         |
| Les cinq jobs CI (`format:check`, `lint:check`, `typecheck`, `test`, `build`) sont verts, sortie réelle à l'appui | `.github/workflows/ci.yml`                                 |

## 6. Règles de rapport (anti faux-positifs)

Ces règles priment sur l'exhaustivité. Un rapport bruyant ne se lit pas.

1. **Tout finding est vérifié dans le code avant d'être écrit.** On cite `fichier:ligne`.
   Un finding sans localisation exacte n'est pas rapporté.
2. **Tout finding porte un scénario de casse concret** : entrées / état → sortie fausse ou
   crash. Si on ne sait pas l'écrire, c'est que le finding n'est pas mûr — on le descend en
   `Info` ou on le supprime.
3. **Pas de finding sur du code non touché par le diff**, sauf si le diff l'aggrave ou en
   dépend directement (là c'est un finding de contexte, à annoncer comme tel).
4. **Pas de reformulation de préférence personnelle en défaut.** Si c'est un goût, c'est
   `Info` et c'est préfixé `Nit:`.
5. **Ne jamais affirmer un résultat de gate qu'on n'a pas lancé.** « les tests passent »
   exige la sortie réelle (cf. `fix-execution-zsh-pipestatus.md` pour la lecture des codes
   de sortie).
6. **Signaler explicitement ce qui n'a pas pu être vérifié** plutôt que de laisser croire
   à une couverture complète.

---

## 7. Format de sortie

```markdown
## Verdict

<GO | GO-with-changes | NO-GO> — <une phrase>

## Critical (n)

### <titre court>

- **Où** : `chemin/fichier.ts:42`
- **Défaut** : <une phrase>
- **Casse** : <entrées/état → conséquence>
- **Correctif** : <la piste, pas un pavé>

## Warning (n)

<même structure>

## Info (n)

<liste courte, une ligne chacun>

## Non vérifié

<ce qui n'a pas pu l'être, et pourquoi>
```

**Verdict** : `NO-GO` uniquement s'il existe au moins un `Critical`.
`GO-with-changes` si des `Warning` doivent être traités avant merge.

---

## Exemple

- ❌ **Avant (incorrect)** : « J'ai relu la PR, ça me semble propre, quelques remarques de
  style » — pas de sévérité, pas de localisation, pas de scénario, review faite dans le
  contexte principal par celui qui a écrit le code.
- ✅ **Après (correct)** : agent Sonnet 5 briefé avec le diff + cette rule + les gates réels →
  rapport structuré, `Warning` sur `session.repo.ts:41` (« la liste des sessions est
  projetée depuis `getRawMany()`, que `ClassSerializerInterceptor` ne filtre pas → le
  `@Exclude()` posé sur le token est inopérant et le token part au client »), scénario de
  casse explicite, verdict `GO-with-changes`.
