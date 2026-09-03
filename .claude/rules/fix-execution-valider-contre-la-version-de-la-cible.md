# RULE : Valider une config/un artefact contre la VERSION que la cible exécute — jamais contre « l'image récente qui traîne »

## Contexte

PR #60 (déploiement Docker/Ansible). Le template nginx utilisait `http2 on;`,
directive introduite en **nginx 1.25.1**. Ma validation : `nginx -t` dans
`nginx:alpine` (1.27+) → vert. Or les cibles réelles (Ubuntu LTS) livrent
nginx **1.18** (22.04) ou **1.24** (24.04), où `http2 on;` est une directive
inconnue → `nginx -t` échoue → le playbook aurait cassé le reverse proxy des
deux machines au premier run réel. Découvert seulement lors de la grande review
demandée par l'utilisateur, en vérifiant la version minimale de chaque
directive.

## Erreur commise

Avoir conclu « config nginx validée » à partir d'un `nginx -t` exécuté dans une
image récente choisie par commodité (celle du cache local), sans vérifier que
la **version** de l'outil validateur correspondait à celle des machines cibles.
Le gate était vert, mais il ne mesurait pas la réalité.

## Cause racine

Confusion entre « l'outil accepte ma config » et « la version de l'outil que la
prod exécute accepte ma config ». Les surfaces de config (directives nginx,
options compose, flags CLI…) évoluent entre versions ; un validateur plus
récent accepte des constructions que la cible rejette (et inversement). Même
famille d'erreur que `fix-execution-worktree-node-modules-remonte-au-parent`
(gate local ≠ CI) et que le harnais Jinja ≠ réglages Ansible : un environnement
de vérification qui diverge de l'environnement d'exécution produit des gates
menteurs.

## Règle à appliquer

1. **Avant de valider une config avec un binaire conteneurisé/local, établir la
   version que la CIBLE exécute** (paquet de la distro cible : `rmadison`, doc
   Ubuntu/Debian packages, ou `ssh cible '<bin> -v'` quand la machine existe) et
   valider avec **cette version-là** (image taguée `nginx:1.18`, pas `latest`).
2. **Pour chaque directive/option « moderne » utilisée, vérifier sa version
   d'introduction** dans la doc officielle avant de l'adopter, et préférer la
   syntaxe compatible avec la version la plus ancienne du parc (ici
   `listen 443 ssl http2;` plutôt que `http2 on;`), avec un commentaire datant
   le choix.
3. **Énoncer la version validée dans le rapport** : « `nginx -t` vert » ne veut
   rien dire ; « `nginx -t` vert sur 1.18 (= Ubuntu 22.04 cible) et 1.31 » est
   un résultat. Si la parité de version n'a pas pu être testée (image
   indisponible…), le dire explicitement au lieu de laisser croire au vert
   complet.
4. Généralisation : tout validateur (compose, ansible, node, ffmpeg…) utilisé
   pour un gate doit être **à la version de l'environnement d'exécution** ou la
   divergence doit être documentée comme un risque résiduel.

## Exemple

- ❌ **Avant (incorrect)** : `docker run nginx:alpine nginx -t` (1.27+) → vert →
  « config validée » ; la cible Ubuntu 22.04 (nginx 1.18) rejette `http2 on;`.
- ✅ **Après (correct)** : la doc nginx date `http2 on;` de 1.25.1 ; le parc est
  en 1.18/1.24 → syntaxe `listen 443 ssl http2;` + commentaire « revisit quand
  le parc atteint 1.25 » + validation sur `nginx:1.18` **et** une version
  récente, versions citées dans le rapport.
