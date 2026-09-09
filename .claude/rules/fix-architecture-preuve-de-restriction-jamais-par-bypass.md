# RULE : Prouver qu'une restriction de sécurité tient se fait sur la VRAIE connexion — jamais via un rôle de contournement qui hérite ses droits

## Contexte

EPI-183, journal d'audit inaltérable. La table `audit_log` porte un
`REVOKE UPDATE, DELETE, TRUNCATE` sur le rôle applicatif. Pour le prouver en
intégration, j'ai créé un rôle Postgres jetable
(`audit_log_probe_test_role`) qui héritait des droits du rôle applicatif par
simple `GRANT "<rôle applicatif>" TO "<probe>"`, et j'ai fait tourner les
assertions négatives (`UPDATE`/`DELETE`/`TRUNCATE` refusés) à travers ce
rôle plutôt qu'à travers `context.dataSource` — la connexion que l'app et
tous les autres tests utilisent réellement.

L'utilisateur a bloqué : « You shouldn't have done that. […] never give the
permissions to bypass a database rule in the tests or anywhere. You need to
find a way to fix that without cheating. »

En creusant pourquoi ce rôle de contournement avait semblé nécessaire, la
vraie cause est apparue : le conteneur Postgres éphémère des tests
bootstrape le rôle applicatif COMME son propre super-utilisateur
(`PostgreSqlContainer.withUsername('cartepro')` → `initdb` fait de ce nom le
super-utilisateur, qui contourne tout contrôle d'ACL, `REVOKE` compris). Et
en vérifiant le déploiement réel : `docker-compose.yaml` faisait exactement
la même chose (`POSTGRES_USER=${DATABASE_USER}`, aucun script d'init,
aucune rétrogradation). **Le `REVOKE` était décoratif partout, pas
seulement dans la suite de tests.**

## Erreur commise

Avoir répondu à « ma connexion de test ne peut pas prouver cette
restriction » en inventant un SECOND rôle qui contourne le problème pour un
seul test, au lieu de traiter le fait que LA VRAIE connexion (celle de
l'app, celle de tous les autres tests) n'était restreinte nulle part. Le
test passait, mais il ne prouvait plus rien sur ce que l'application fait
réellement — il prouvait une propriété d'un rôle qui n'existe que pour ce
test.

Aggravant : je n'ai vérifié cette hypothèse (« le rôle applicatif est
superutilisateur ») que pour l'environnement de test, sans la confronter au
déploiement réel — alors que c'était exactement le même mécanisme de
provisioning (`POSTGRES_USER`) des deux côtés.

## Cause racine

Un test qui n'arrive pas à observer une restriction a deux lectures
possibles : (a) la restriction n'existe pas vraiment sur la connexion qui
compte, ou (b) l'environnement de test donne à cette connexion plus de
pouvoir que l'environnement cible. Créer un rôle de contournement traite
la question comme si c'était un problème DE TEST à contourner, alors que
c'est un signal sur LA CIBLE à corriger. C'est la même famille d'erreur que
`fix-execution-gate-local-qui-charge-plus-que-la-cible.md` (un gate qui
charge plus que la cible ne prouve rien) — ici appliqué à un rôle DB plutôt
qu'à un graphe de modules.

## Règle à appliquer

1. **Une restriction de sécurité (REVOKE, contrainte, garde) se prouve sur
   la connexion que le code sous test utilise réellement.** Si cette
   connexion ne peut pas observer la restriction, le problème est
   l'environnement de test, pas le test.
2. **Ne jamais créer un rôle, un compte ou un contexte qui HÉRITE ou
   REÇOIT les droits d'un autre juste pour faire passer une assertion.**
   Que ce soit par `GRANT role TO probe`, par un `overrideProvider` qui
   neutralise une garde, ou par une variable d'environnement qui relâche
   une contrainte : si la cible ne bénéficie pas de ce relâchement, le test
   ment sur ce qu'il prouve.
3. **Quand l'environnement de test donne PLUS de pouvoir que la cible à la
   connexion applicative, corriger l'environnement de test pour qu'il
   reflète la cible** — pas l'inverse. Ici : provisionner dans le conteneur
   éphémère le même rôle non-superutilisateur que l'application utilise
   réellement en dev/prod, plutôt que de bricoler un rôle à part pour un
   seul fichier de spec.
4. **Une restriction dont le déploiement réel n'a jamais été vérifié est une
   hypothèse, pas un fait.** Avant de déclarer un `REVOKE`/une garde
   « en place », vérifier le provisioning réel (docker-compose, script
   d'init, rôle de connexion) — pas seulement le SQL de la migration qui
   l'exprime. Le SQL peut être correct et rester sans effet si le rôle visé
   est superutilisateur.
5. **Le besoin d'un « utilisateur privilégié » distinct (pour purger des
   fixtures, pour simuler un opérateur) est légitime — mais ce doit être un
   VRAI rôle séparé et documenté (ex. `DATABASE_ADMIN_USER`), jamais un rôle
   qui existe uniquement pour hériter les droits du rôle qu'on teste.**

## Exemple

- ❌ **Avant (incorrect)** : `CREATE ROLE probe; GRANT "cartepro" TO probe;`
  puis assertions `UPDATE`/`DELETE` refusés via `probe` — pendant que
  `context.dataSource` (la vraie connexion app) reste superutilisateur, en
  test comme en prod.
- ✅ **Après (correct)** : le conteneur de test bootstrape un rôle admin
  distinct ; un rôle applicatif non-superutilisateur (`cartepro_app`) est
  provisionné avec exactement les droits qu'il a en prod ; `db-compose.yaml`
  fait de même pour dev/prod. Les assertions `REVOKE` tournent directement
  sur `context.dataSource`. Vérifié en plus par contrôle direct `psql` :
  `cartepro_app` reçoit `permission denied`, `cartepro` (admin) non.
