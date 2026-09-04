# RULE : Une transaction validée est immuable — toute correction est une contre-écriture, jamais un UPDATE/DELETE

## Contexte

Le cahier des charges (`JEB/DNI/2026-002`, §3.2) impose des transactions validées non
modifiables. C'est déjà la raison pour laquelle `synchronize` n'existe pas dans ce
projet (cf. `CLAUDE.md` racine) : une passe de synchronisation est exactement ce qui
pourrait réécrire la table qui porte ces transactions.

Sur EPI-55 (registre des mouvements `wallet_entry`), la question s'est posée : comment
garantir cette immutabilité — un déclencheur PostgreSQL, un `REVOKE` de privilèges, ou
une discipline portée par la logique métier ? TypeORM n'a de toute façon aucun
décorateur pour exprimer un trigger ou un `REVOKE` (donc `db:generate` ne peut rien en
sortir) ; la décision retenue est que la garde est portée par le **service**, pas par
du DDL PostgreSQL écrit à la main.

## Règle à appliquer

1. **Une ligne d'une table de transactions validées** (registre de mouvements,
   paiements, abondements — tout ce qui représente un fait comptable acté) **ne se
   modifie ni ne se supprime jamais.** Pas de `UPDATE`, pas de `DELETE` — ni dans le
   service, ni dans une migration de données, ni en intervention manuelle.
2. **Toute correction s'exprime par une nouvelle ligne : une contre-écriture** (montant
   opposé, référence vers la ligne qu'elle corrige, motif). Le service expose une
   opération « annuler » / « corriger », jamais un `PATCH`/`PUT` sur la ligne d'origine.
3. **C'est de la comptabilité, pas du CRUD.** Le repo d'une entité de ce type n'expose
   ni méthode `update` ni méthode `remove`/`delete`. L'absence de la méthode est la
   garde elle-même, pas une discipline d'appel à retenir.
4. **Cette immutabilité est une garantie de logique métier, pas de schéma DB** (pas de
   trigger, pas de `REVOKE`) : elle vaut ce que vaut le code qui l'applique. Elle doit
   donc être couverte par un test qui prouve qu'aucun chemin du service ne permet de
   muter une ligne existante — pas seulement que la contre-écriture fonctionne.

## Exemple

- ❌ **Avant (incorrect)** : corriger un paiement erroné par
  `paymentRepo.update(id, { amount: correctedAmount })`.
- ✅ **Après (correct)** : `walletEntryService.recordCounterEntry(originalEntryId, {
amount: -originalAmount, reason })` — une nouvelle ligne, jamais une réécriture.
