# RULE : La forme d'un input (y compris « pas de body du tout ») est une décision produit à VÉRIFIER ou POSER en question, jamais à déduire d'un seul endpoint précédent présenté comme réglée

## Contexte

EPI-94, `POST /partner-applications/:id/approve`. En plan mode, mon plan affirmait comme
décision réglée : « Approve has no request body (matching the ticket, and the existing
no-payload `POST`/`@CurrentUser()`-only pattern used by `payment-token`'s `issue()`) ». La
seule preuve derrière ce choix était **un** autre endpoint `POST` du dépôt sans body — pas
une lecture du besoin métier de la fonctionnalité en cours. L'utilisateur a rejeté le plan à
`ExitPlanMode` : « The route should probably take a body with a 'reason' mandatory text,
that will be reported in `partner_review` table. »

## Erreur commise

Avoir présenté « pas de body » comme une décision technique déjà tranchée dans le plan
final, alors que c'était une hypothèse fondée sur un échantillon de taille 1
(`payment-token.issue()`), sans jamais la poser comme question ouverte ni vérifier que le
besoin métier (une décision d'approbation qui alimente une table d'audit) ne réclamait pas
justement un `reason` — c'est-à-dire exactement le genre de donnée qu'une ligne d'audit
existe pour porter.

## Cause racine

Généralisation d'une convention de forme (« les `POST` de ce dépôt n'ont pas de body ») à
partir d'un seul exemple, exactement le mécanisme que
`fix-raisonnement-convention-derivee-d-un-seul-echantillon.md` documente pour les formats de
ticket — ici appliqué à la forme d'une requête HTTP plutôt qu'à un gabarit de texte. Le
signal était pourtant présent dans le code déjà lu pendant l'exploration :
`PartnerApplication.reason` existe, est `NOT NULL`, et n'est alimenté par aucun chemin
d'écriture existant — un champ obligatoire sans producteur est une question qui se pose,
pas un détail à laisser de côté.

## Règle à appliquer

1. **La forme d'un input HTTP (y compris l'absence de body) est un choix produit**, au même
   titre qu'un choix de statut HTTP ou de schéma de payload — pas une simple convention de
   style à copier du dernier endpoint écrit. Avant de la figer dans un plan, vérifier
   qu'elle sert le besoin métier de CETTE fonctionnalité, pas seulement qu'elle ressemble à
   une autre route du dépôt.
2. **Un champ obligatoire (`NOT NULL`) sans aucun chemin d'écriture existant est un signal à
   traiter explicitement**, jamais à contourner en silence (ici : injecter une constante, ou
   rendre la colonne nullable) sans avoir d'abord considéré que le champ existe précisément
   pour recevoir la donnée que la fonctionnalité en cours s'apprête à produire.
3. **Quand une décision de forme d'input repose sur un seul précédent dans le dépôt et n'a
   pas de source dans le besoin exprimé (ticket, cahier des charges), la présenter comme
   option ouverte dans le plan** (ou via `AskUserQuestion`), jamais comme un fait acquis
   dans la section Design decisions. Le test : « si je supprime cette phrase, le lecteur du
   plan sait-il qu'il y avait un choix à faire ? » Si non, la décision a été prise à sa
   place sans qu'il le sache.
4. Complète `fix-raisonnement-convention-derivee-d-un-seul-echantillon.md` (qui couvre les
   gabarits de texte/documents) et
   `fix-process-defaut-visible-jamais-classe-mineur-ni-descope-seul.md` (qui couvre les
   arbitrages laissant un défaut derrière eux) : celle-ci couvre spécifiquement la forme
   d'un contrat d'API déduite d'un précédent unique et présentée comme réglée.

## Exemple

- ❌ **Avant (incorrect)** : « Approve has no request body (matching the ticket, and the
  existing no-payload `POST`/`@CurrentUser()`-only pattern used by `payment-token`'s
  `issue()`). » — présenté comme acquis dans le plan final, alors que `reason: text NOT
NULL` sur `PartnerApplication` n'avait aucun chemin d'écriture et attendait précisément
  cette donnée.
- ✅ **Après (correct)** : « Le seul autre `POST` du dépôt n'a pas de body, mais
  `PartnerApplication.reason` est `NOT NULL` et rien ne l'alimente aujourd'hui — deux
  options : (a) pas de body, on injecte une constante ou on rend la colonne nullable ; (b)
  la requête porte un `reason` obligatoire, cohérent avec le rôle d'audit de la table.
  Laquelle veux-tu ? »
