# RULE : Un worktree SANS `node_modules` résout les imports depuis le dépôt PARENT — un gate local vert n'y prouve rien sur une dépendance non déclarée

## Contexte

Sur la PR des liens d'invitation (#46), j'ai ajouté à un spec d'intégration
`import request from 'supertest'` pour vérifier le transport HTTP. En local,
depuis le worktree `.claude/worktrees/backend-invitation-links-26f570/` :
`bun run typecheck` → exit 0, `bun run lint` → 0 erreur, le spec → 13/13 vert.
J'ai poussé en annonçant les gates verts.

La CI a échoué immédiatement, sur **deux** jobs :

```
Typecheck : src/.../links.integration.spec.ts(10,21): error TS2307:
            Cannot find module 'supertest' or its corresponding type declarations.
Lint      : 25 errors (no-unsafe-call / no-unsafe-member-access / no-unsafe-assignment)
```

`supertest` **n'est pas** dans `package.json` (ni deps, ni devDeps). Il traîne
seulement, non déclaré, dans le `node_modules/` du dépôt parent
— vestige d'une install antérieure.

## Erreur commise

Avoir importé un package **non déclaré dans `package.json`**, puis avoir
affirmé « gates verts » sur la foi de gates locaux qui ne mesuraient pas la même
chose que la CI. J'ai annoncé un résultat vérifié qui ne l'était pas.

Aggravant : les 25 erreurs de lint étaient toutes des _conséquences_ du type non
résolu. En local, le type se résolvait (via le parent), donc `lint` ne voyait
rien non plus. **Un seul import manquant a rendu DEUX gates locaux menteurs à la
fois** — la redondance apparente des gates ne protège de rien quand ils
partagent la même résolution de modules faussée.

## Cause racine

Le worktree n'a **pas son propre `node_modules`**. La résolution Node/TypeScript
remonte l'arborescence jusqu'au premier `node_modules` trouvé — ici celui du
dépôt principal, qui contient des paquets **installés mais non déclarés**. La CI,
elle, part d'un checkout propre et fait `bun install --frozen-lockfile` : elle ne
voit que ce que `package.json` déclare.

Autrement dit : dans un worktree, **`node_modules` est un sur-ensemble non
versionné de `package.json`**. Tout ce qui vit dans cet écart passe en local et
casse en CI. Le lockfile n'est pas non plus une autorité ici : `bun.lock` ne
liste pas un paquet resté sur le disque après avoir été retiré de `package.json`.

## Règle à appliquer

1. **Avant d'importer un package externe dans ce repo, vérifier qu'il est
   déclaré** — pas qu'il est importable, pas qu'il est dans `node_modules` :
   ```
   node -e "const p=require('./package.json'); console.log(({...p.dependencies,...p.devDependencies})['<pkg>'] ?? 'NON DÉCLARÉ')"
   ```
   `NON DÉCLARÉ` ⇒ soit on l'ajoute explicitement (décision à annoncer, pas à
   glisser dans une PR de feature), soit on s'en passe. Jamais « ça compile donc
   c'est bon ».
2. **Ne jamais déduire la présence d'une dépendance d'un import qui résout.**
   Dans un worktree, ça ne prouve que l'existence d'un `node_modules` quelque
   part au-dessus. `package.json` est la seule autorité.
3. **Se méfier des doc de stack** : `CLAUDE.md` listait `supertest ^7.2.2` dans
   la stack technique alors qu'il n'était plus dans `package.json`. Une doc de
   stack n'est pas un manifeste — la vérifier contre `package.json`.
4. **Préférer une solution sans nouvelle dépendance** quand le besoin est
   marginal. Ici, les trois assertions de transport (status, en-têtes, corps) se
   font en `fetch` natif contre `app.listen(0)` : zéro dépendance, même preuve.
   Ajouter une devDependency pour trois `expect` est une décision de l'owner du
   repo, pas un effet de bord d'une PR de feature.
5. **Corollaire de reporting** : ne pas annoncer « gates verts » depuis un
   worktree quand le diff introduit un import externe, sans avoir passé le
   point 1. Si le doute subsiste, le vrai test d'équivalence est un checkout
   propre + `bun install --frozen-lockfile` + les scripts de la CI
   (`lint:check`, pas `lint` qui `--fix`).

## Exemple

- ❌ **Avant (incorrect)** : `import request from 'supertest'` → `bun run typecheck`
  exit 0 et `bun run lint` 0 erreur dans le worktree (résolus via le
  `node_modules` du parent) → push annoncé vert → CI rouge sur Typecheck **et**
  Lint (`TS2307` + 25 erreurs dérivées).
- ✅ **Après (correct)** : vérifier `package.json` → `supertest` NON DÉCLARÉ →
  réécrire les trois assertions en `fetch` natif contre `app.listen(0)`
  (`AddressInfo` de `net`, builtin) → aucun import externe nouveau → CI verte,
  couverture identique (13/13).
