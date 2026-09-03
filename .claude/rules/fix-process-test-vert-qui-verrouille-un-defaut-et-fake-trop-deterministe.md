# RULE : Une assertion décrit le comportement VOULU, jamais le comportement observé — et un fake de test plus déterministe que la vraie dépendance rend une classe entière de bugs invisible

## Contexte

YNO-178, découvert en auditant le cache d'images côté iOS (2026-08-27). Les avatars du bloc
« amis qui y vont » du feed sortent de la base comme **URLs CDN publiques complètes**, et
l'hydratation les re-signait comme si c'étaient des clés d'objet R2. L'URL produite pointait
sur un objet inexistant : **aucun avatar d'ami ne s'est jamais affiché en production**, sur
l'écran principal de l'app, et l'URL changeant à chaque requête, aucun cache client ne
pouvait fonctionner.

Ce bug a vécu à travers plusieurs PR et plusieurs suites vertes. Deux mécanismes l'ont
protégé, et aucun n'est un oubli de test :

1. **Un spec l'assertait comme la vérité.**
   `feed-following.integration.spec.ts:130` contenait
   `expect(friend.avatarUrl).toContain('https://fake/signed/')`.
   Quelqu'un avait lu la sortie, constaté un préfixe de signature, et l'avait gravé dans une
   assertion. Le correctif a fait **rougir ce test** — c'est ainsi qu'on a su qu'il gardait
   le défaut.

2. **Le fake partagé était plus déterministe que le vrai présigneur.**
   `FakeStorage.getSignedDownloadUrl` renvoie `https://fake/signed/${key}` — une fonction
   pure de la clé. Le vrai présigneur produit une signature **différente à chaque appel**.
   Sous ce fake, un chemin de lecture qui re-signe paraît parfaitement stable : la moitié
   « cache-busting » du bug était **structurellement invisible** pour tous les specs du feed,
   quel que soit leur nombre.

## Erreur commise

Avoir écrit une assertion en recopiant ce que le code produisait, au lieu d'énoncer ce que
le produit exige. Et avoir laissé un test double modéliser une dépendance **plus sage que la
réalité**, sans que rien ne signale que la propriété perdue (la variabilité) était justement
celle qui portait un risque.

## Cause racine

Une assertion écrite depuis la sortie observée ne teste plus rien : elle transforme le
comportement courant en spécification. Elle passe le jour où on l'écrit — par construction —
et elle passera tous les jours suivants, y compris ceux où le comportement est faux. Pire
qu'un test manquant : un test manquant laisse un trou visible, celui-là **fabrique de la
confiance**.

Et un fake ne se contente pas de remplacer une dépendance : il **définit ce que les tests
peuvent voir**. Toute propriété du vrai composant que le fake ne reproduit pas (variabilité,
latence, échec, ordre, expiration) devient un angle mort commun à **toute** la suite. Le fake
n'a pas menti sur une valeur ; il a supprimé une dimension.

## Règle à appliquer

1. **Une assertion énonce ce que le produit exige, pas ce que le code a renvoyé.** Avant
   d'écrire `expect(x).toBe(valeur)`, répondre à « pourquoi cette valeur est-elle la bonne
   pour l'utilisateur ? ». Si la seule réponse est « c'est ce que ça sort », l'assertion ne
   doit pas être écrite. Ne JAMAIS coller dans un test une sortie qu'on vient d'observer sans
   l'avoir dérivée du besoin.
2. **Se méfier des assertions qui reconnaissent une FORME plutôt qu'une valeur** —
   `toContain('https://fake/signed/')`, `toMatch(/^prefix/)`, `toBeTruthy()` sur une URL.
   Elles passent pour toute une famille de valeurs, dont les fausses. Quand la donnée
   attendue est connue (une colonne semée par la fixture), asserter **l'égalité avec la
   source**, pas la ressemblance avec la sortie.
3. **Un correctif qui fait rougir un test existant est un SIGNAL, jamais une gêne.** Avant
   d'ajuster le test rouge, se demander : est-ce que ce test gardait le bug ? Si oui, sa
   réécriture fait partie du correctif et doit être **dite dans la PR** — c'est la preuve la
   plus forte que le défaut était réel et durable.
4. **Un test double doit conserver les propriétés de la vraie dépendance qui portent un
   risque.** Un présigneur varie à chaque appel : le fake doit varier. Une horloge avance :
   le fake doit avancer. Une API échoue : le fake doit pouvoir échouer. Un fake déterministe
   là où le réel ne l'est pas est un choix à justifier, pas un défaut.
5. **Ne pas modifier un fake partagé pour tester un cas particulier** : d'autres specs
   assertent son comportement exact. **Injecter un double local** (paramètre optionnel sur le
   harnais, comme `bootstrapFeed({ storage })`) qui reproduit la propriété manquante. Diff
   contenu, zéro impact sur l'existant.
6. **Quand un fake s'avère plus sage que le réel, le signaler même après avoir contourné**
   (`fix-process-rework-incoherences-preexistantes.md`) : l'angle mort reste ouvert pour tout
   futur chemin de lecture. Ici, `FakeStorage` modélise toujours le présigneur comme
   déterministe.
7. **Corollaire de revue** : dans un diff de test, chercher les assertions qui décrivent la
   mécanique interne (un préfixe de signature, un format d'id, une structure de clé) plutôt
   qu'un fait utilisateur. Chacune est un défaut potentiel en train d'être verrouillé.

## Exemple

- ❌ **Avant (incorrect)** :
  ```ts
  // écrit en recopiant la sortie : grave le bug dans la suite
  expect(friend.avatarUrl).toContain('https://fake/signed/');
  ```
  Sous un fake qui renvoie `https://fake/signed/${key}` pour toute clé, ce test reste vert
  que l'URL soit correcte ou doublement signée — et la variabilité du vrai présigneur, seule
  à révéler le cassage de cache, n'existe pas dans la suite.
- ✅ **Après (correct)** :
  ```ts
  // la valeur semée est l'autorité : l'avatar servi est la colonne, à l'octet près
  expect(friend.avatarUrl).toBe(seededUser.avatarUrl);
  // et la propriété que le vrai présigneur aurait cassée, asserte explicitement
  expect(first.avatarUrl).toBe(second.avatarUrl); // deux requêtes consécutives
  ```
  avec un double local dont la signature **varie** à chaque appel, comme le vrai présigneur.
