# RULE : Un invariant qu'on fait asserter par un test doit être CALCULÉ avant d'être écrit dans un brief — jamais paraphrasé de mémoire

## Contexte

Tâche donut sur `reveal-zone.helper.ts` (branche `feat/reveal-gate`). Plus tôt dans la
même session, j'avais analysé le code **correctement** et écrit :

> « C = P + offset(cell(P)). Deux pins P1, P2 dans la MÊME cellule → même offset →
> C1 = P1 + o, C2 = P2 + o → C1 − C2 = P1 − P2 (tiny). »

Puis, en rédigeant le brief de délégation au planner/exécuteur, j'ai écrit l'inverse :

> « Rewrite it to test the real invariant : two DISTINCT pins that round to the same
> grid cell **must yield the same centre**. »

C'est faux. La graine HMAC est bien la cellule, mais l'offset est appliqué au **point
exact**, pas au centre de cellule. L'exécuteur l'a découvert au RED (`Expected: >= 199,
Received: 155.9`), a mesuré, et a asserté le vrai invariant. Vérification indépendante :
mêmes clés de grille, offsets identiques à `0.000000` m près, **centres distants de
13,31 m** → `identical centre? false`.

## Erreur commise

Avoir énoncé dans un brief de délégation, **comme un fait à faire asserter par un test**,
une propriété du code que je n'avais pas recalculée — et qui contredisait ma propre
analyse correcte faite plus tôt dans la même conversation. L'erreur n'a pas été rattrapée
par ma relecture mais par le RED de l'agent.

## Cause racine

Compression paresseuse au moment de déléguer. « Un lieu = un centre » était le _slogan_
que je manipulais depuis le début de la session (il vient du pattern Airbnb/Strava) ; en
rédigeant le brief j'ai réutilisé le slogan au lieu de la mécanique réelle du code
(« un lieu = un **vecteur de jitter** partagé »). Le slogan et le code disent deux choses
différentes, et c'est précisément l'écart qui devait être testé. Un raisonnement correct
en amont ne protège pas d'une paraphrase fausse en aval : la dernière formulation écrite
est celle qui est exécutée.

## Règle à appliquer

1. **Tout invariant qu'un brief demande d'ASSERTER dans un test doit d'abord être
   CALCULÉ** (script jetable, `bun run` sur le vrai helper, REPL) — jamais dérivé de
   mémoire ni recopié d'un raisonnement antérieur de la conversation. Si je fais écrire
   `expect(A).toEqual(B)`, j'ai exécuté A et B au préalable et je connais leurs valeurs.
2. **Un slogan de design n'est pas une spec de test.** « Un lieu = un centre », « la zone
   est stable », « c'est idempotent » sont des résumés destinés à un humain. Avant de les
   faire asserter, les traduire en la mécanique exacte du code (quelle fonction, de quelle
   entrée, produit quelle sortie) et vérifier que la traduction tient.
3. **Si le brief ne peut pas porter la valeur calculée, il doit porter l'ordre de la
   calculer** : « dérive l'invariant depuis le code et mesure-le avant d'asserter », jamais
   « l'invariant est X, asserte X ». Un agent à qui on donne un faux invariant comme acquis
   le forcera au lieu de le questionner (ici, il aurait pu snapper les centres sur la
   grille — une re-randomisation de masse, exactement le dommage que la tâche évitait).
4. **Corollaire de revue** : quand un agent conteste un invariant de mon brief, mesurer
   avant de trancher. Ne jamais réaffirmer le brief par autorité.
5. Cette règle complète `fix-raisonnement-ne-pas-halluciner-contenu-fichier.md` : celle-là
   couvre « je n'ai pas lu le fichier » ; celle-ci couvre « je l'ai lu, mon analyse était
   juste, mais j'ai délégué une paraphrase fausse ».

## Exemple

- ❌ **Avant (incorrect)** : brief → « two distinct pins in the same grid cell must yield
  **the same centre** — rewrite the test to assert that. » (faux : le test échoue au RED,
  et forcé, il aurait cassé la propriété de sécurité).
- ✅ **Après (correct)** : lancer d'abord `computeApproximateZone` sur les deux pins →
  constater `|offset diff| = 0.000000 m` mais `centre distance = 13.31 m` → brief →
  « deux pins d'une même cellule partagent le **vecteur de jitter** ; leurs centres
  s'écartent exactement du delta de pin. Asserte ces deux faits. »
