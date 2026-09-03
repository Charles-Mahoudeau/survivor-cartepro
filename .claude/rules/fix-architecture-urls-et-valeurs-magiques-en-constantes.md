# RULE : URLs de base, magic numbers et magic strings — JAMAIS inline, toujours en constantes nommées top-level

## Contexte

Dans l'adapter FCM (`push/services/helpers/fcm.service.ts`, PR push-notifications),
l'URL d'envoi était **construite inline dans la méthode** :
`const url = `https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send``,
avec en plus des magic numbers/strings éparpillés (status `404`/`410`, regex
`UNREGISTERED|NOT_FOUND`, `slice(0, 200)`), et des `throw new Error('...')` non typés.
L'utilisateur a repéré l'URL hardcodée immédiatement : « Base url hardcodé c'est quoi ça ???? ».

## Erreur commise

1. URL de base d'un service externe **enfouie dans le corps d'une méthode** au lieu d'une
   constante top-level du module (alors que `OAUTH_TOKEN_URL` voisin était, lui, une constante —
   incohérence dans le même fichier).
2. Magic numbers / magic strings inline (codes HTTP signifiants, regex de matching d'erreur,
   tailles de troncature) sans nom qui porte l'intention.
3. Erreurs jetées en `new Error(...)` brut depuis un adapter, sans classe d'erreur typée —
   impossible à discriminer par `instanceof` côté appelant.

## Cause racine

Écriture « au fil de l'eau » du code d'adapter : les littéraux restent là où ils ont été
tapés la première fois. Le projet a pourtant une convention claire (cf.
`fix-architecture-config-metier-constantes-pas-env`) : les valeurs nommées vivent en
constantes typées top-level ou dans `<module>/constants/`.

## Règle à appliquer

1. **Toute URL de base d'un service externe = constante top-level nommée** (dans le fichier
   adapter ou `<module>/constants/`). Env **uniquement** si la valeur varie par déploiement
   (endpoint self-hosted, sandbox vs prod) — une URL publique fixe (FCM, OAuth Google) est une
   constante de code, pas de l'env.
2. **Zéro magic number / magic string dans les corps de méthode** : tout littéral porteur de
   sens (code HTTP discriminant, regex de classification, TTL, taille de troncature, divisor)
   reçoit un **nom** en constante top-level. Le test : si on doit lire le contexte pour
   comprendre ce que vaut le littéral, il doit être nommé.
3. **Les adapters jettent des erreurs typées** : une classe d'erreur dédiée par famille de
   panne (`class FcmTokenExchangeError extends Error`), jamais `throw new Error('...')` brut.
   L'appelant doit pouvoir discriminer par `instanceof` sans parser un message.
4. La cohérence intra-fichier compte : si une URL du fichier est en constante, TOUTES le sont.

## Exemple

- ❌ **Avant (incorrect)** :
  ```ts
  const url = `https://fcm.googleapis.com/v1/projects/${this.projectId}/messages:send`;
  if (response.status === 404 || response.status === 410 || /UNREGISTERED|NOT_FOUND/.test(body)) ...
  throw new Error(`FCM token exchange failed (${response.status})`);
  ```
- ✅ **Après (correct)** :
  ```ts
  const FCM_API_BASE_URL = 'https://fcm.googleapis.com/v1';
  const STALE_TOKEN_STATUSES = [404, 410];
  const STALE_TOKEN_ERROR_PATTERN = /UNREGISTERED|NOT_FOUND/;

  const url = `${FCM_API_BASE_URL}/projects/${this.projectId}/messages:send`;
  throw new FcmTokenExchangeError(response.status, body);
  ```
