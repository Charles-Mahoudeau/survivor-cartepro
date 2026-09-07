# RULE : Un verrou ne protège que ce qu'on RELIT sous lui — toute valeur lue avant le `FOR UPDATE` est périmée, y compris celle qu'on croit avoir « déjà »

## Contexte

PR #61 (abondements). `POST /allocations/:id/apply` crédite tous les portefeuilles
actifs d'un employeur, en une transaction. J'avais écrit :

```ts
const allocation = await this.findOrThrow(id);      // lecture NON verrouillée
this.refuseApplied(allocation);

await this.dataSource.transaction(async (manager) => {
  const locked = await this.allocationRepo.lockStatusById(manager, id); // SELECT … FOR UPDATE
  if (locked.status === APPLIED) throw new ConflictException(…);

  await this.walletService.creditFromAllocation(manager, {
    amount: Number(allocation.amount),               // ← la valeur d'AVANT le verrou
  });
  await this.allocationRepo.markApplied(manager, id, appliedAt);
});
```

Le verrou était bien là, au bon endroit, sur la bonne ligne. Mais il ne relisait
que `status`. Le **montant** venait de la lecture d'avant, et n'était jamais
revérifié.

Conséquence, trouvée par la revue et confirmée par un test qui la reproduit : un
`PATCH /allocations/:id` qui passe le montant de 90 € à 9 000 € et committe dans
la fenêtre entre les deux lectures fait créditer **90 €** à chaque portefeuille,
puis fige la ligne à **9 000 €**. La table est immuable une fois appliquée : le
registre dit 90 €, la campagne dit 9 000 €, et plus rien ne peut les réconcilier.

## Erreur commise

Avoir raisonné « la ligne est verrouillée, donc l'opération est protégée », alors
que la propriété réelle d'un `SELECT … FOR UPDATE` est beaucoup plus étroite :
**les colonnes qu'il ramène sont fraîches, et rien d'autre.** J'ai posé le verrou
pour la sérialisation (empêcher deux `apply` simultanés) et j'en ai tiré une
garantie de fraîcheur que je n'avais pas demandée.

Aggravant : j'avais **restreint** la projection de la lecture verrouillée
(`select(['allocation.id', 'allocation.status'])`) en croyant bien faire — ne lire
que ce dont on a besoin. La restriction était exactement ce qui laissait le
montant hors du verrou. L'optimisation a créé la faille.

Second aggravant : j'ai écrit dans la description de la PR « la ligne est
verrouillée avant que son état soit relu, donc un second `apply` concurrent
attend le premier » — vrai, et cité comme si ça couvrait tout le chemin.

## Cause racine

Un verrou de ligne a **deux** effets qu'on confond parce qu'ils arrivent
ensemble : il **sérialise** les écrivains, et il **rafraîchit** ce que la requête
qui le pose sélectionne. Le premier vaut pour la ligne entière ; le second ne
vaut que pour les colonnes ramenées. Un objet lu avant, en mémoire, ne devient
pas frais parce qu'une autre requête a verrouillé la même ligne ensuite.

Et le défaut est invisible en test séquentiel : un `PATCH` puis un `apply` l'un
après l'autre relit le nouveau montant dans la lecture non verrouillée aussi. Il
faut une exécution entrelacée pour que les deux valeurs divergent — donc aucune
suite écrite naïvement ne l'attrape.

## Règle à appliquer

1. **Toute valeur qu'une transaction écrit, dérive ou annonce doit venir de la
   lecture verrouillée**, jamais d'un objet chargé avant d'entrer dans la
   transaction. L'objet d'avant sert à répondre 404 tôt et à éviter d'ouvrir une
   transaction pour rien — il ne sert **à rien d'autre**.
2. **La projection d'une lecture verrouillée se dimensionne sur ce que la
   transaction va utiliser**, pas sur le strict minimum du contrôle qui suit.
   Restreindre un `SELECT … FOR UPDATE` à la colonne testée est un piège : ça a
   l'air économe et ça sort du verrou tout le reste.
3. **Quand une écriture doit être conditionnée par un état, mettre l'état dans le
   `WHERE`** plutôt que de le tester avant : `UPDATE … WHERE id = :id AND status
= 'draft'` puis lire le nombre de lignes affectées est atomique par
   construction, sans verrou et sans fenêtre. Un `SELECT` de contrôle suivi d'un
   `UPDATE` inconditionnel en a toujours une.
4. **Un test séquentiel ne prouve rien sur une fenêtre de concurrence.** Le test
   qui compte tient la ligne verrouillée depuis le test, laisse la requête sous
   test atteindre le verrou, committe la modification concurrente, puis relâche.
   Attendre le blocage plutôt que dormir un temps arbitraire :
   `SELECT count(*) FROM pg_stat_activity WHERE wait_event_type = 'Lock' AND
state = 'active'`.
5. **Prouver que le test discrimine** avant de s'en servir comme filet :
   réintroduire le défaut, constater que ce test-là rougit et que les autres
   restent verts, puis restaurer. Un test de concurrence écrit après le correctif
   et jamais vu rouge ne vaut pas mieux qu'un commentaire.
6. **Ne jamais écrire dans une PR qu'un verrou « protège l'opération ».** Écrire
   ce qu'il sérialise et ce qu'il relit, séparément. Si les deux phrases ne
   couvrent pas toutes les valeurs utilisées, il manque quelque chose au verrou.

## Exemple

- ❌ **Avant (incorrect)** : `lockStatusById` ne sélectionne que `id` et `status` ;
  le crédit part sur `Number(allocation.amount)` lu hors transaction. Une
  modification concurrente rend le registre et la campagne incohérents, pour
  toujours.
- ✅ **Après (correct)** : `lockById` sélectionne `id`, `status` **et** `amount` ;
  le crédit et le total annoncé partent de `locked.amount`. En prime, la
  modification d'un brouillon devient `UPDATE … WHERE id = :id AND status =
'draft'` avec lecture des lignes affectées, donc elle rate proprement au lieu
  de courir contre l'application.
