# RULE : Un problème énoncé par un tiers (courrier, ticket, revue) se VÉRIFIE dans le dépôt avant d'entrer dans un plan — sinon on fait trancher une décision qui n'a pas d'objet

## Contexte

Plan de fin de chantier CartePro (2026-09-08). Le courrier du cabinet du 7 septembre
demande de remplacer les partenaires de démonstration et prévient :

> « Vos transactions pointent sur ces partenaires. Vous ne pouvez pas supprimer une ligne
> de la table des partenaires sans décider du sort des écritures qui la référencent […]
> choisissez, appliquez, et écrivez-moi les deux lignes qui justifient le choix. »

J'ai repris ce cadrage tel quel et je l'ai posé en tête du plan comme **décision ouverte
bloquante `O1`**, avec quatre options et une recommandation argumentée : substitution,
anonymisation, archivage, contre-écritures.

Nolan a répondu : « O1 j'ai pas compris ».

Il avait raison de ne pas comprendre : **le problème n'existe pas dans ce dépôt.** Mesuré
après coup, en trois commandes :

- les quatre partenaires nominatifs du cabinet n'ont **jamais** été dans le dépôt —
  l'historique de `apps/frontend/app/mock-data.ts` et de `scripts/seed/dataset.ts` ne
  contient que des enseignes inventées par l'équipe (Poney Dream 78, KostumParty…) ;
- le jeu de démonstration est produit par un **seed déterministe sur base vide**. Changer
  la liste des enseignes et relancer le seed ne laisse aucune écriture derrière.

Il n'y avait donc aucune écriture historique à migrer, et rien à trancher. La vraie réponse
au courrier tenait en deux lignes — « notre jeu est régénéré, les enseignes retirées n'ont
laissé aucune trace » — au lieu d'un arbitrage à quatre branches placé en tête d'un plan.

## Erreur commise

Avoir traité l'affirmation d'un tiers sur l'état du dépôt (« vos transactions pointent
sur ces partenaires ») comme un **fait mesuré**, et avoir construit sur elle une décision
que je demandais à l'utilisateur de prendre.

Aggravant : j'avais déjà lu `scripts/seed/dataset.ts` dans la même session — j'y avais même
relevé les douze noms d'enseignes pour écrire une autre ligne du plan. L'information qui
invalidait `O1` était dans mon contexte, et je ne l'ai pas rapprochée de la question.

Second aggravant : une décision ouverte coûte cher. Elle passe en tête de réponse, elle
bloque des tâches, elle consomme l'attention de la personne qui doit trancher. En poser une
qui n'a pas d'objet, c'est dépenser cette attention pour rien — et masquer les vraies.

## Cause racine

Confusion entre **le périmètre d'un courrier** et **l'état d'un dépôt**. Un courrier, un
ticket ou une revue décrivent un problème _supposé_ ; ils sont écrits par quelqu'un qui n'a
pas le code sous les yeux. Leur autorité porte sur ce qui est **demandé**, jamais sur ce qui
**est**.

Et la formulation d'un tiers arrive déjà structurée en options (« substitution,
anonymisation, archivage, contre-écritures ») : elle a la forme d'une analyse, donc elle se
recopie sans résistance. C'est exactement le mécanisme de
`fix-raisonnement-invariant-delegue-doit-etre-calcule.md`, avec un courrier à la place d'un
raisonnement antérieur.

## Règle à appliquer

1. **Toute affirmation d'un tiers sur l'état du dépôt se vérifie dans le dépôt avant
   d'entrer dans un plan**, même quand elle vient d'une autorité (client, cabinet, revue,
   ticket). Le grep de vérification part du nom réel de la chose — ici la table, la colonne
   et le fichier de seed — pas de la reformulation du courrier.
2. **Une décision ouverte doit porter la preuve que son objet existe.** Avant d'écrire
   « à trancher », répondre à : quelle ligne du dépôt rend ce choix nécessaire ? Si la
   réponse est « le courrier le dit », ce n'est pas une décision, c'est une hypothèse à
   mesurer.
3. **Une question du lecteur qui ne comprend pas une décision ouverte est d'abord un signal
   sur la décision, pas sur le lecteur.** Mesurer avant de réexpliquer. Réexpliquer plus
   clairement un problème inexistant est la pire des réponses possibles.
4. **Distinguer, dans la réponse au tiers, ce qui est demandé de ce qui est constaté.**
   Quand un problème annoncé ne se vérifie pas, on ne l'ignore pas en silence : on écrit
   pourquoi il ne se pose pas ici, et ce qu'on ferait s'il se posait. C'est cette phrase-là
   qui répond au courrier.
5. **Un état mesuré vieillit vite quand plusieurs personnes travaillent.** Un relevé du
   dépôt daté de la veille au soir n'est plus une mesure le lendemain matin : le rafraîchir
   avant de s'appuyer dessus. Le même plan a annoncé un chantier d'architecture entier
   comme « absent » alors qu'il avait été mergé pendant la nuit.

## Exemple

- ❌ **Avant (incorrect)** : le courrier dit « vos transactions pointent sur ces
  partenaires » → j'écris une décision ouverte à quatre options en tête du plan, avec une
  recommandation d'archivage argumentée sur l'immuabilité des écritures.
- ✅ **Après (correct)** : `git log -S` sur les noms d'enseignes et lecture de
  `scripts/seed/dataset.ts` → le dépôt n'a jamais porté les partenaires du cabinet et le jeu
  est régénéré sur base vide → aucune décision à prendre, et la réponse au cabinet est :
  « notre jeu de démonstration est reconstruit par un seed déterministe, les enseignes
  retirées n'ont laissé aucune écriture ; sur une base déjà peuplée, le partenaire serait
  archivé et conservé, jamais supprimé. »
