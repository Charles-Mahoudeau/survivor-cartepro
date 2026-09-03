# RULE : Un gate local qui CHARGE plus que la cible ne prouve rien — avant d'annoncer « intégration verte », vérifier que la suite enregistre ses objets par le MÊME mécanisme que la prod

## Contexte

PR #13 (entités métier de CartePro). `main` venait d'ajouter Better Auth, donc la table
`user` appartient désormais à `modules/user/entities/user.entity.ts`. J'ai replié les cinq
relations métier (`employer`, `partner`, `wallets`, `decidedPartnerReviews`,
`createdAllocations`) sur cette entité, supprimé le doublon `modules/users/`, régénéré la
migration, lancé les cinq gates en local — **intégration 51/51 verte** — et annoncé le tout
comme vérifié.

La CI a rendu **51 tests sur 51 en échec**, tous sur la même ligne :

```
TypeORMError: Entity metadata for User#employer was not found.
```

Cause réelle : les entités métier n'étaient déclarées dans **aucun module**. Elles
atteignaient la connexion uniquement par les globs de source de `data-source.ts`
(`join(cwd, 'src', '**', '*.entity.ts')`), que la CLI TypeORM résout et que l'application ne
résout pas. `DatabaseModule` passait pourtant **les deux** — les globs _et_
`autoLoadEntities: true`. En local, les globs matchaient : la suite chargeait 15 entités
alors que les modules n'en déclaraient que 6. La suite mesurait donc une composition qui
n'existe nulle part ailleurs.

Vérification faite après coup : `bun run build` puis `bun dist/main.js` reproduit l'erreur
**à l'identique en local**. L'image déployée aurait donc crashé au boot, pas seulement la
CI — et aucun de mes gates ne le disait.

## Erreur commise

Avoir annoncé « intégration 51/51 ✅ » sur une suite qui, **par construction**, ne pouvait
pas voir le défaut introduit. La sortie était réelle, le chiffre était vrai, et la
conclusion était fausse : ce n'est pas un gate que j'ai oublié de lancer, c'est un gate qui
ne mesurait pas ce que je croyais lui faire mesurer.

Aggravant : le commentaire de `DatabaseModule` disait déjà noir sur blanc que les globs
« resolve to nothing once the app is bundled ». L'information était sous mes yeux, dans le
fichier qui configure la connexion, et je ne l'ai pas rapprochée du fait que ma modification
rendait l'entité `User` dépendante de neuf entités qu'aucun module ne déclarait.

## Cause racine

Un environnement de test peut charger **un sur-ensemble** de ce que charge la cible. Quand
c'est le cas, tout ce qui vit dans l'écart passe en local et casse en CI et en prod. Ici
l'écart était : « ce que le glob trouve » moins « ce que `forFeature` déclare ».

Et un changement de ce type ne se voit sur aucune ligne du diff : ajouter une relation à une
entité déjà enregistrée rend d'un coup obligatoire l'enregistrement de sa cible. Le
compilateur valide le type de la relation ; il ne dit rien du graphe d'injection. Même
mécanique que
`fix-architecture-elargir-une-projection-reaudite-toutes-ses-routes.md` : le compilateur
attrape les formes, jamais l'enregistrement ni les droits.

## Règle à appliquer

1. **Avant d'annoncer un gate vert sur une suite qui boote l'application, vérifier que la
   suite enregistre ses objets par le même mécanisme que la cible.** Ici : les entités
   arrivent par `TypeOrmModule.forFeature()`, jamais par un glob de source. Un
   environnement de vérification qui en charge davantage rend une classe entière de défauts
   invisible (cf.
   `fix-process-test-vert-qui-verrouille-un-defaut-et-fake-trop-deterministe.md`, point 4 :
   un double plus sage que le réel).
2. **Quand un doute existe, reproduire la cible en local avant de pousser.** Pour ce dépôt,
   le test d'équivalence coûte trente secondes :
   ```sh
   bun run build && bun apps/backend/dist/main.js
   ```
   Le bundle n'a plus aucun fichier source à globber : s'il boote, l'enregistrement tient ;
   s'il crashe, la CI crashera pareil. Ne jamais annoncer « build ✅ » comme preuve de boot —
   `build` compile, il ne démarre rien.
3. **Toute entité nouvellement atteignable depuis une entité déjà enregistrée doit être
   déclarée dans un module.** Ajouter une relation à `User` étend l'ensemble des entités que
   la connexion doit connaître : le rayon du changement est le rayon du graphe de relations,
   pas celui du fichier modifié.
4. **Quand l'écart entre l'environnement de test et la cible est la cause, le corriger fait
   partie du correctif.** Retirer les globs du chemin applicatif (`entities: []` +
   `autoLoadEntities`) est ce qui rend la suite capable d'attraper le défaut la prochaine
   fois. Sans ça, on repousse en espérant que la CI soit d'accord.
5. **Prouver qu'un gate discrimine avant de s'appuyer dessus** : retirer un module de
   `AppModule` et constater que la suite passe de 51 verts à 51 rouges. Un gate dont on n'a
   pas vu le rouge n'est pas un gate.
6. **Ne jamais relayer « la CI dira »** : lire la sortie réelle du job en échec
   (`gh run view --job <id> --log-failed`) et remonter au premier message, pas au dernier —
   ici la vraie ligne était le `ERROR [TypeOrmModule] Unable to connect to the database`
   du tout début, dont les 51 échecs n'étaient que la conséquence.

## Exemple

- ❌ **Avant (incorrect)** : entités métier dans aucun module, `DatabaseModule` passe les
  globs **et** `autoLoadEntities` → `bun run test:integration` local : 51/51 verts →
  « gates verts » annoncés → CI : 51/51 rouges sur
  `Entity metadata for User#employer was not found`, et l'image aurait crashé au boot.
- ✅ **Après (correct)** : un module par domaine déclare ses tables via
  `TypeOrmModule.forFeature([...])`, `DatabaseModule` passe `entities: []` pour n'enregistrer
  que par ce chemin, contrôle fait en retirant un module (51 rouges), puis reproduction de la
  cible en local (`bun run build && bun dist/main.js` → « Nest application successfully
  started ») avant de pousser.
