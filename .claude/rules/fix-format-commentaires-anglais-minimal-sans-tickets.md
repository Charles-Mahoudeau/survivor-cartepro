# RULE : Commentaires de code — anglais uniquement, minimaux dans les fonctions, ZÉRO référence à un ticket / une tâche / une user story

## Contexte

Dans le module `participation`, mon code était pollué par : des commentaires en **français**
(hérités du code existant), une **avalanche de commentaires inline** dans les corps de
fonction, et surtout des **références à des artefacts de planification** partout — `CR-02`,
`WR-06`, `PART-05`, `IN-01`, `Pitfall 6`, `Assumption A2`, `Success Criterion #4`,
`DECISION #3`, `WR-02`… — dans les commentaires ET dans les noms de tests (`it('… (CR-02)')`).
L'utilisateur a tranché : « arrête les commentaires en français, le moins de commentaires
possible dans les fonctions, et aucune mention de user story / tâche / quoi que ce soit ».

## Erreur commise

1. Commentaires de code rédigés en **français**.
2. **Sur-commentage** : des commentaires inline qui paraphrasent le code au lieu de le laisser
   parler (`// 1. Serialize concurrent joins`, `// Re-read the joiner's row`, etc.).
3. **Fuite des artefacts GSD/review dans le code** : IDs de requirement (`PART-0x`), de plan,
   de finding de revue (`CR-0x`, `WR-0x`, `IN-0x`), de pitfall, d'assumption, de décision,
   « Success Criterion », numéros de tâche — collés dans les commentaires et les noms de tests.
   Le code n'est pas le tracker : ces références ne veulent rien dire pour quelqu'un qui lit le
   code, vieillissent mal, et puent.

## Cause racine

Recopie du contexte de planification (PLAN.md, REVIEW.md, requirements) directement dans les
commentaires, et reprise du style verbeux + français du code legacy. Le code doit être
auto-explicatif ; le « pourquoi » métier vit dans la PR / le tracker, pas dans des commentaires
estampillés d'IDs internes.

## Règle à appliquer

1. **Tous les commentaires de code en ANGLAIS.** Zéro français. (Cette règle-ci, comme les
   autres `.claude/rules/`, reste en français — c'est de la doc projet ; la consigne ne porte
   que sur les commentaires DANS le code source `src/`, `test/`, `scripts/`, migrations.)
2. **Le moins de commentaires possible dans les corps de fonction.** Par défaut : aucun. Un
   commentaire inline n'est justifié que si le **pourquoi** est réellement non-évident (un
   contournement subtil, une contrainte non visible dans le code). Jamais un commentaire qui
   décrit _ce que_ fait la ligne suivante — le code le dit déjà. Pas de commentaires numérotés
   (`// 1.`, `// 2.`) qui narrent les étapes.
3. **JAMAIS de référence à un artefact de planification dans le code** (commentaires, noms de
   variables, noms de tests, messages) : ni requirement ID (`PART-0x`, `FEED-0x`, `PARTY-0x`,
   `MOD-0x`, `USER-0x`, `RANK-0x`…), ni finding de revue (`CR-0x`, `WR-0x`, `IN-0x`), ni
   `Pitfall N`, ni `Assumption AX`, ni `Decision #N` / `DECISION`, ni `Success Criterion`, ni
   numéro de plan / de tâche / d'issue. Si un invariant mérite une explication, on l'explique
   **en clair**, sans l'ID.
4. **Noms de tests** (`describe`/`it`) : décrivent le **comportement** en anglais clair, sans
   suffixe de ticket. ✅ `it('lets a user who left re-join')` — ❌ `it('… re-join (CR-02)')`.
5. **JSDoc** : seulement là où il apporte une vraie valeur (contrat d'une API publique, méthode
   de repo non triviale). Concis, anglais, sans ID de ticket. Pas de JSDoc qui répète la
   signature.

## Exemple

- ❌ **Avant (incorrect)** :
  ```ts
  // Atomically enforce capacity and persist every member (requester + group)
  // as a reactivated accepted membership row under the party-row lock (CR-02 /
  // CR-03 / WR-05). Pour les soirées PUBLIC, on ajoute directement.
  // 1. Serialize concurrent joins to this party (CR-03).
  await manager.query(`SELECT 1 FROM "party" WHERE id = $1 FOR UPDATE`, [
    partyId,
  ]);
  ```
- ✅ **Après (correct)** :
  ```ts
  // Lock the party row so concurrent joins can't overflow capacity.
  await manager.query(`SELECT 1 FROM "party" WHERE id = $1 FOR UPDATE`, [
    partyId,
  ]);
  ```
  (un seul commentaire, anglais, le _pourquoi_ non-évident — le lock — sans aucun ID).
