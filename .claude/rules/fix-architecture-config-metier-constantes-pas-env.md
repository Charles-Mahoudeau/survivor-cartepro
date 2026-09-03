# RULE : Config MÉTIER = constantes typées en code (`<module>/constants/…`), JAMAIS dans l'env

## Contexte

En planifiant la Phase 4 (feed PULL), le scoring placeholder avait besoin de 6 paramètres
de pondération (poids `w_geo/w_time/w_eng/w_cap/w_social` + horizon d'imminence). Le plan
généré (et que j'ai présenté/endossé) les mettait dans **l'env** : `FEED_W_*` +
`FEED_IMMINENCE_HORIZON_S` ajoutés à `src/config/env/env.schema.ts` (Zod) + `.env.example`,
lus via `ConfigService`. L'utilisateur a corrigé : « env c'est de la merde, une config
métier doit être dans la config des constantes ».

## Erreur commise

Avoir traité du **tuning métier/produit** (poids d'un algorithme de ranking) comme de la
**config d'infra/déploiement**, en le mettant dans l'env. Ça :

- pollue un `env.schema.ts` jusque-là strictement infra (PORT / DB_* / R2_*) avec des
  paramètres de domaine ;
- rend le réglage _stringly-typed_, éparpillé, invisible au code-review et non versionné
  comme du code ;
- ignore la convention du repo : les constantes de domaine vivent dans
  `<module>/constants/<module>.constants.ts` (cf. `media/asset/constants/media.constants.ts`
  → `export const MAX_VIDEO_BYTES = …`).

## Cause racine

Application aveugle du réflexe « 12-factor : config in env » à des paramètres qui n'en
relèvent pas. L'env est pour ce qui **varie par déploiement** ou est **secret** (URLs, ports,
credentials, secrets). Les poids/seuils/horizons d'un algorithme sont une **décision produit**,
identique sur tous les environnements, qui doit passer en **review de code** — pas un cran
d'ops modifiable hors review.

## Règle à appliquer

1. **Toute config MÉTIER/produit (poids, seuils, horizons, ratios, tuning d'algo, caps
   fonctionnels) = constantes typées en CODE**, dans `<module>/constants/<module>.constants.ts`
   (convention du repo : `export const SCREAMING_SNAKE = …` + JSDoc « tune via these constants »).
   Préférer un type qui **force la complétude** (ex. `Record<TermName, number>`) pour que
   l'ajout d'un cas casse la compilation tant que la constante n'est pas mise à jour.
2. **`env.schema.ts` reste strictement INFRA / DÉPLOIEMENT / SECRETS** : `NODE_ENV`, `PORT`,
   `DB_*`, `R2_*`, clés/API, etc. On n'y ajoute **jamais** un paramètre de domaine.
3. Critère de tri : « est-ce que ça change d'un déploiement à l'autre / est-ce un secret ? »
   → oui = env ; « est-ce une décision produit identique partout qui doit être review-ée ? »
   → non = constante de code.
4. Si un réglage à chaud (sans redeploy) est réellement requis, c'est une **décision explicite**
   (table de config en DB / feature-flag service), pas un glissement par défaut vers l'env.

## Exemple

- ❌ **Avant (incorrect)** : `env.schema.ts` += `FEED_W_GEO: z.coerce.number().default(1.0)` …
  `FEED_IMMINENCE_HORIZON_S`, lus via `ConfigService.get('FEED_W_GEO')`.
- ✅ **Après (correct)** : `src/modules/discovery/matching/scoring/constants/scoring.constants.ts`
  → `export const FEED_SCORING_WEIGHTS: Record<FeedTermName, number> = { proximity: 1.0, … };`
  `export const FEED_IMMINENCE_HORIZON_SECONDS = 48 * 60 * 60;` — `env.schema.ts` non touché.
  Bonus : quand RANK-01 ajoute le terme `affinity`, on ajoute une clé à la constante typée
  (le `Record` force la complétude) — zéro changement de mécanisme, zéro nouvelle var d'env.
