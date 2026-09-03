# RULE : Une PR s'ouvre en DRAFT et ne passe « ready » qu'une fois le travail validé — un pipeline se paie, et une PR ready le repaie à chaque push

## Contexte

Incident constaté sur un autre dépôt du même auteur, dont les chiffres ne sont pas
ceux de ce projet mais dont le mécanisme l'est : une organisation sur le **plan gratuit
GitHub Actions** dispose d'un allotissement mensuel de minutes. Un seul dépôt l'a
consommé **entièrement en un mois**. Quand il est épuisé, un job hébergé échoue avant
son premier step, sans aucun log : ça ressemble à un workflow cassé et ça n'en est pas
un.

Ce qui l'a vidé n'est pas la CI de merge, c'est la CI d'itération : **9 pipelines
complets en une seule journée** de travail — ouverture de PR, corrections, force-push
après squash, merges. À ~10 minutes-runner par pipeline et à cette cadence,
l'allotissement d'un mois part en une vingtaine de jours ouvrés.

Ce dépôt-ci lance **cinq jobs par push sur une PR** (`format:check`, `lint:check`,
`typecheck`, `test`, `build` — `.github/workflows/ci.yml`). Une PR ouverte ready et
itérée en ready les rejoue intégralement à chaque correction.

## Erreur commise

Avoir ouvert chaque PR directement **prête à review**, puis avoir poussé dessus au fil
de l'eau : chaque correction, chaque reformatage, chaque force-push de squash a relancé
le pipeline entier. Le coût n'apparaît nulle part dans mon travail — il apparaît sur la
facture, un mois plus tard, sous la forme d'une CI qui refuse de démarrer.

## Cause racine

Le CLAUDE.md global dit « **PR dès que la feature est prête** — on ouvre la Pull Request
sans attendre ». J'ai lu « prête » comme « la branche a des commits », donc la PR
naissait ready et **itérait** en ready.

Les deux exigences ne sont pas en conflit une fois qu'on distingue **le moment** de
l'ouverture de **l'état** de la PR : la PR s'ouvre bien tout de suite — elle est visible,
liable, commentable — mais en brouillon. Ce qui change, c'est son état, pas sa date.

Second facteur, à ne pas se raconter : **le statut draft ne saute PAS les Actions tout
seul.** Une PR en brouillon déclenche `pull_request` exactement comme une autre. Ce qui
économise réellement, c'est une garde dans le workflow ; sans elle, ouvrir en draft ne
coûte pas moins cher, ça en a juste l'air.

## Règle à appliquer

1. **Toute PR s'ouvre en brouillon** : `gh pr create --draft …`. Sans exception, y
   compris pour un changement d'une ligne.
2. **Elle passe « ready » (`gh pr ready <n>`) seulement quand le travail est terminé ET
   validé en local** — typecheck, `lint:check`, `format:check`, unit, intégration, tous
   verts, sortie lue. Passer une PR ready, c'est demander le pipeline : on ne le demande
   qu'une fois.
3. **L'ouverture reste immédiate.** La règle 3 du CLAUDE.md global est respectée : la PR
   existe dès que la branche existe. On ne diffère pas l'ouverture, on diffère la
   demande de CI.
4. **Ne jamais supposer que draft = gratuit.** Vérifier que le workflow porte la garde
   (`if: github.event_name != 'pull_request' || !github.event.pull_request.draft` sur
   les jobs racines, et `ready_for_review` dans `types:`). Sur un dépôt qui ne l'a pas,
   ouvrir en draft ne change rien au coût et il faut le dire au lieu de le croire.
5. **Grouper les corrections.** Sur une PR déjà ready, chaque push est un pipeline
   complet. On accumule les correctifs en local, on lance les gates une fois, on pousse
   une fois.
6. **Annoncer l'état dans la réponse** : « PR #N ouverte en brouillon » puis « passée
   ready après gates verts ». L'utilisateur doit savoir si la CI a été demandée ou non.

## Exemple

- ❌ **Avant (incorrect)** : `gh pr create …` → la PR naît ready, le pipeline part ;
  trois corrections suivent, trois pushes, trois pipelines ; un squash en `--force-with-lease`,
  un quatrième. Quatre pipelines pour une feature.
- ✅ **Après (correct)** : `gh pr create --draft …` → aucun pipeline. Les corrections et
  le squash se font en brouillon, gratuitement. Gates lancés en local, verts, lus. Puis
  `gh pr ready <n>` → **un** pipeline, sur l'état final.
