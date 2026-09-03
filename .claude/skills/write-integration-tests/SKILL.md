---
name: write-integration-tests
description: 'Écrire un test d''intégration dans ce projet. Déclenché quand l''utilisateur demande un "test d''intégration", "integration test", "spec d''intégration", ou quand le code à tester touche la DB, Redis, BullMQ, Discord, Stripe, le filesystem, ou orchestre plusieurs services. Pose le contrat strict : vraie DB via transaction rollback, vraie DI NestJS via `Test.createTestingModule({ imports: [SomeModule] })` pour câbler les vraies classes (zéro `new XxxService(...)` à la main), fixtures pour TOUTES les entités, AUCUN mock de classe interne (y compris les Monitor), `.overrideProvider` uniquement pour les adapters d''unmanaged deps (Discord, Stripe), sandbox > mock si disponible (Stripe).'
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

<objective>
Garantir que chaque test d'intégration écrit dans ce projet vérifie le **comportement de bout en bout d'un scénario métier** à travers la **vraie DB** et les **vraies dépendances internes**, en ne mockant **que** les dépendances out-of-process **non contrôlées** (Discord SDK, Stripe, etc.).

Source de vérité conceptuelle : Vladimir Khorikov, _Unit Testing: Principles, Practices and Patterns_, chapitres 8, 9, 10.

- Un test d'intégration valide le système **en intégration avec ses out-of-process dependencies** — DB en premier.
- Couvrir le **longest happy path** qui traverse toutes les out-of-process deps, plus les edge cases qu'un test unitaire ne peut pas atteindre.
- Concentrer l'effort sur les **logiques qui peuvent échouer** : transactions financières concurrentes, transitions de state machines, contraintes DB, side effects multi-tables, race conditions. Un service qui fait `repo.create()` n'a pas besoin d'un test d'intégration dédié — il sera couvert transitivement par le scénario qui l'utilise.
- **Managed deps** (DB Postgres applicative, Redis / bullMQ) → utilisées **as-is** dans les tests.
- **Unmanaged deps** (Discord, Stripe) → mockées OU sandbox réelle si disponible (toujours préférer le sandbox quand il existe).

Si le code à tester n'a aucune dépendance externe et que la logique testée est purement interne (parser, builder, formatter, pipe stateless), **ce n'est pas un test d'intégration** — rediriger vers `write-unit-tests`.
</objective>

<scope>

## Définition d'un test d'intégration dans ce projet

Un test d'intégration prouve qu'un **scénario métier complet** se déroule correctement quand on le branche sur :

1. La **vraie DB** Postgres (test_db, via `globalThis.createTestTransaction()`) ou Redis / BullMQ si nécessaire.
2. Les **vraies implémentations** de tous les repos, services internes, helpers, state machines, factories, dispatchers de la chaîne concernée.
3. Des **mocks ciblés UNIQUEMENT** aux frontières out-of-process non contrôlées (Discord SDK, etc.).
4. Une **sandbox réelle** quand la dépendance non contrôlée en fournit une (Stripe → toujours préférer Stripe Test Mode + clés de test plutôt qu'un mock du SDK).

Un test d'intégration :

1. **Ouvre une transaction de test** dans `beforeEach` via `globalThis.createTestTransaction()` et la rollback dans `afterEach`.
2. **Crée toutes ses données via des fixtures** (`*.fixture.ts`) — jamais d'INSERT manuel dans le spec, jamais de stub `findById` qui shortcut la DB.
3. **Câble la chaîne complète de services** via `Test.createTestingModule({ imports: [SomeModule] })` (vraie DI Nest, vrai module de prod) — pas de `new XxxService(...)` à la main.
4. **Couvre le longest happy path** du scénario en premier, puis les edge cases.
5. **Vérifie l'état final dans la DB** via le repo (pas via l'output de la méthode SUT), en faisant une **lecture indépendante** de l'input.

## Quand c'est un test d'intégration et pas un test unitaire

C'est un test d'intégration si **au moins une** de ces conditions est vraie :

- Le code lit ou écrit en DB (même indirectement via un repo injecté).
- Le code orchestre plusieurs services internes (controller, application service, state machine).
- Le code dépend d'une transaction DB pour son atomicité.
- Le code dialogue avec Redis / BullMQ (managed), Discord, Stripe, ou tout autre SDK externe.
- Le code dépend de matviews / triggers / contraintes Postgres pour valider son comportement.
- Le test devrait casser si la migration Drizzle changeait la forme d'une table.

## Quand c'est un test unitaire et pas un test d'intégration

Si **toutes** ces conditions sont vraies, suivre `write-unit-tests` à la place :

- Le code est une fonction pure, une classe stateless, un parser, un builder, un formatter, un pipe.
- Le code ne touche ni DB, ni Redis, ni HTTP, ni filesystem, ni horloge système.
- Les inputs peuvent être construits synthétiquement sans fixture DB.

</scope>

<dependency_classification>

## Classification des dépendances out-of-process (Khorikov Ch. 8)

### Managed dependencies — UTILISER AS-IS dans le test

Une dépendance est **managed** si elle n'est accessible qu'à travers notre application. Les interactions avec elle sont des détails d'implémentation invisibles à l'extérieur.

- **Postgres applicatif (`test_db`)** → managed. Vraie DB, vraies migrations, vrai schéma.
- **Redis / BullMQ** → managed. Vraie instance Redis, vraies queues, vrais jobs sérialisés. Aucune autre application ne consomme nos queues ; c'est un détail d'implémentation interne.

Règle : **jamais de mock** pour ces deps, jamais de SQLite/in-memory, jamais de fake-redis, jamais d'abstraction `IDatabaseRepository` / `IQueueService`. On utilise les vraies classes (`NodePgDatabase`, `Queue` BullMQ).

#### Cas particulier des workers BullMQ

Le **worker** BullMQ (`new Worker(queueName, processor, ...)`) ne doit **pas** être démarré pendant les tests : il consommerait les jobs en arrière-plan et créerait du non-déterminisme. À la place :

1. Utiliser la **vraie `Queue`** pour enfiler les jobs (`queue.add(...)`) et asserter leur présence via `queue.getJobs(...)` / `queue.getJob(jobId)`.
2. **Instancier le processor manuellement** (`new XxxProcessor(...)`) et l'appeler comme une fonction (`await processor.process(job)`) pour exercer le code de bout en bout dans le test.
3. Vider la queue dans `beforeEach` ou `afterEach` (`await queue.obliterate({ force: true })`) pour éviter les fuites d'un test à l'autre — Redis ne participe pas au rollback PG.

Voir le pattern dans `broadcast-lifecycle.integration.spec.ts` qui instancie déjà le processor à la main ; côté queue, basculer du mock vers la vraie `Queue` quand on touche ce code.

### Unmanaged dependencies — MOCK ou SANDBOX

Une dépendance est **unmanaged** si d'autres systèmes (clients externes, services tiers, plateformes) peuvent observer ou consommer ses effets. Le contrat avec elle fait partie du comportement observable du système.

Familles dans ce projet :

| Dépendance              | Sandbox dispo ?                                                                            | Choix par défaut                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Discord SDK (HTTP REST) | Non utilisable en intégration (rate limits, comptes test instables, side effects visibles) | **Mock** au niveau de l'adapter `DiscordService`                             |
| Stripe SDK              | **OUI — Stripe Test Mode** (clés `sk_test_...`)                                            | **TOUJOURS demander à l'utilisateur** si sandbox ou mock pour ce test précis |
| SMTP, autres APIs HTTP  | À évaluer cas par cas                                                                      | Demander                                                                     |

(Redis / BullMQ ne sont pas listés ici : ils sont **managed** — voir section précédente.)

### Règle "ask before mocking" pour les unmanaged avec sandbox

Quand le code à tester touche une dépendance non contrôlée qui **dispose d'un sandbox officiel** (Stripe en tête), **ne pas décider seul** entre mock et sandbox :

> "Le scénario X touche Stripe (création d'un PaymentIntent / Setup d'un client / webhook). Stripe expose un Test Mode officiel. Pour ce spec : sandbox réelle (`STRIPE_TEST_SECRET_KEY`) ou mock de l'adapter `StripeService` ? Sandbox = vrai contrat, lent, dépend du réseau et de l'API Stripe. Mock = rapide et déterministe mais on ne valide pas la forme réelle des objets Stripe."

Attendre la réponse avant d'écrire le test.

### Mock au système edge (Khorikov Ch. 9)

Quand on mock une unmanaged dep, **mocker le dernier type de notre code qui dialogue avec elle**, pas un intermédiaire.

- ✅ Mock `DiscordService` (notre adapter qui wrap `discord.js`) — c'est l'edge Discord.
- ❌ Mock `BroadcastService` parce qu'il appelle `DiscordService` — on est trop haut dans la chaîne, on perd la couverture des couches intermédiaires.
- ✅ Mock `StripeService` (notre adapter qui wrap `stripe-node`) — c'est l'edge Stripe (si on choisit le mock plutôt que la sandbox).
- ❌ Mock `BillingService` parce qu'il appelle `StripeService` — détail d'implémentation.

Plus le mock est près de l'edge, plus la couverture est forte (plus de code réel exercé).

### Mock "only types you own"

Ne pas mocker `discord.js`, `stripe-node` directement. Toujours passer par un adapter du projet (`DiscordService`, `StripeService`). Si l'adapter n'existe pas et qu'on en a besoin, **le créer** plutôt que mocker le SDK tiers brut.

</dependency_classification>

<rules>

## Règles absolues

### 1. Vrai contexte d'exécution NestJS via `Test.createTestingModule`

La doc Nest est explicite : `Test.createTestingModule` fournit **un contexte d'exécution qui simule essentiellement tout l'environnement d'exécution Nest**. C'est ce qu'il faut utiliser pour les tests d'intégration. Pas de wiring manuel `new XxxRepo(db) + new XxxService(repo, ...)` — on importe le **vrai module de production** et on laisse la DI Nest faire son travail.

```ts
import { Test, type TestingModule } from '@nestjs/testing';
import { TreasurerModule } from '../treasurer.module';

let moduleRef: TestingModule;
let treasurerService: TreasurerService;

beforeEach(async () => {
  tx = await globalThis.createTestTransaction();

  moduleRef = await Test.createTestingModule({
    imports: [TestDatabaseModule.forRoot(tx.db), TreasurerModule],
  }).compile();

  treasurerService = moduleRef.get(TreasurerService);
});

afterEach(async () => {
  await moduleRef?.close();
  await tx?.rollback();
});
```

Bénéfices par rapport au wiring manuel :

- **Le module de production est testé** — si quelqu'un casse `TreasurerModule` (oublie d'exporter un service, casse un import, ajoute un provider manquant), le spec le détecte immédiatement.
- **Résilient aux changements de constructor** — un nouveau dep dans `TreasurerService`, c'est le `TreasurerModule` qui gère, pas le spec.
- **Conforme à la doc Nest** : "vous donne des accroches qui facilitent la gestion des instances de classe, y compris le moquage et le remplacement".

Tout ce qui est interdit en spec d'intégration :

```ts
// ❌ INTERDIT — wiring manuel new XxxService(...) à la main
const ledgerRepo = new LedgerRepo(db);
const ledgerService = new LedgerService(ledgerRepo);
// ⇒ contourne TreasurerModule, ne teste pas le wiring de prod.

// ❌ INTERDIT — stub d'un service interne
const streamServiceStub = { findById: jest.fn(async (id) => fakeStream) };

// ❌ INTERDIT — stub d'un repo interne
const broadcastRepoStub = { findActiveByVariantId: jest.fn() } as any;

// ❌ INTERDIT — Proxy noop / jest.fn() pour les Monitor (et autres classes internes)
const noopMonitor = new Proxy({}, { get: () => jest.fn() });
// ⇒ Les Monitor sont des classes internes Nest (Logger/telemetry), pas des deps externes.
//   On les laisse tourner pour de vrai. S'ils écrivent dans des logs en mémoire ou
//   du structlog, c'est OK. S'ils faisaient un appel HTTP externe, ils seraient à
//   classer comme adapter d'unmanaged dep (et donc pas dans le module domaine).

// ❌ INTERDIT — INSERT manuel à la place d'une fixture
await db.execute(sql`INSERT INTO advertiser (id, type) VALUES (...)`);

// ❌ INTERDIT — SQLite, in-memory, contenu d'une autre DB
const inMemoryDb = drizzle(new SQLiteDatabase(':memory:'));

// ❌ INTERDIT — mock d'un SDK tiers brut sans passer par un adapter
jest.mock('discord.js', () => ({ ... }));
```

Voir aussi `rules/fix-tests-no-mocks-only-fixtures.md` (interdit les stubs déjà rejetés par l'utilisateur).

#### Injecter `tx.db` dans la DI

`DATABASE_DB` est normalement fourni par `DatabaseModule.forRoot(...)` qui ouvre un vrai pool sur l'URL de prod, indépendant de la transaction de test. En test, on a besoin que `DATABASE_DB` pointe sur la connexion transaction-scopée. **Toujours utiliser le helper partagé** :

```ts
import { TestDatabaseModule } from '@/test/setup/test-database.module';

// dans beforeEach :
moduleRef = await Test.createTestingModule({
  imports: [TestDatabaseModule.forRoot(tx.db), SomeModule],
}).compile();
```

Le helper est défini une seule fois dans [`src/test/setup/test-database.module.ts`](../../../src/test/setup/test-database.module.ts). Il est `@Global()` (obligatoire — sans ça les sous-modules du graphe ne voient pas `DATABASE_DB` et la DI explose avec `Nest can't resolve dependencies of the XxxRepo (?). Argument "DATABASE_DB" at index [0] is not available`).

**Ne pas redéfinir un `TestDatabaseModule` inline dans le spec.** Si tu as besoin d'un comportement différent (par exemple une factory async), étends le helper partagé — il sert toutes les specs.

#### Mocker à l'edge d'une **unmanaged** dep

Seule exception au "tout en vrai" : les adapters d'unmanaged deps (Discord, Stripe sans sandbox). On les substitue via `.overrideProvider(XxxService).useValue(...)` :

```ts
moduleRef = await Test.createTestingModule({
  imports: [TestDatabaseModule.forRoot(tx.db), BroadcastModule],
})
  .overrideProvider(DiscordService)
  .useValue({
    sendMessage: jest.fn().mockResolvedValue({ id: 'msg-1' }),
    deleteMessage: jest.fn().mockResolvedValue(undefined),
  })
  .compile();
```

C'est le **seul** override autorisé en plus de `DATABASE_DB` (et toujours uniquement pour les unmanaged sans sandbox utilisable).

### 2. Une fixture par entité, fixture = factory + setup DB réel

Chaque entité métier a **sa propre fixture** dans un fichier `*.fixture.ts` voisin du spec ou du model :

```
src/modules/app/advertise/campaign/specs/
├── campaign.fixture.ts          → CampaignFixture.create(db, overrides?)
└── campaign-lifecycle.integration.spec.ts
```

Forme canonique d'une fixture (pattern Object Mother de Khorikov Ch. 10) :

```ts
export class XxxFixture {
  static async create(
    db: NodePgDatabase,
    overrides?: Partial<typeof xxxTable.$inferInsert>,
  ): Promise<Xxx> {
    // 1. Auto-create FK parents si pas fournis dans overrides
    const parentId = overrides?.parentId ?? (await ParentFixture.create(db)).id;

    // 2. Insert dans la DB (managed → on touche directement)
    const [created] = await db
      .insert(xxxTable)
      .values({
        // valeurs par défaut sensées
        name: `Test Xxx ${uid()}`,
        status: XxxStatus.ACTIVE,
        parentId,
        // overrides écrasent les défauts
        ...overrides,
      })
      .returning();
    return created;
  }
}
```

Règles spécifiques aux fixtures :

- **Classe statique** avec une méthode `create(db, overrides?)` qui retourne l'entité créée.
- **`uid()`** (`@/test/setup/unique-id`) pour les champs uniques (`name`, `externalId`, etc.) — empêche les collisions cross-test.
- **Auto-create des FK parents** quand pas fournis. Une fixture `CampaignFixture` doit savoir créer un `Advertiser`, une `Audience`, un `Ledger` parent à la volée.
- **Pas de "teardown"** explicite à écrire : la transaction rollback dans `afterEach` nettoie tout. Le `setup` de la fixture, c'est son `create()`. Pas de `cleanup()` à appeler manuellement.
- **Une fixture peut appeler un autre fixture** (composition), jamais un service du domaine. Si on a besoin du _side effect_ d'un service (ex: créer un advertiser avec un ledger funded de 1000), c'est **un helper local au spec** qui orchestre fixtures + services, **pas dans la fixture**.

#### Exception : fixture qui passe par un SDK externe (sandbox)

Si une entité ne peut exister que via une API externe (ex: un `StripeCustomer` n'existe que côté Stripe), la fixture passe par le sandbox réel :

```ts
export class StripeCustomerFixture {
  static async create(
    stripe: Stripe, // sandbox client
    overrides?: Stripe.CustomerCreateParams,
  ): Promise<Stripe.Customer> {
    return stripe.customers.create({
      email: `test-${uid()}@example.test`,
      ...overrides,
    });
  }

  // Stripe ne se rollback pas — cleanup explicite si nécessaire
  static async cleanup(stripe: Stripe, customerId: string) {
    await stripe.customers.del(customerId).catch(() => {});
  }
}
```

Le cleanup explicite est obligatoire ici, géré dans `afterEach` du spec qui utilise la fixture.

### 3. DI Nest pour câbler la chaîne — `Test.createTestingModule`

Pattern obligatoire pour câbler les services : on importe le **vrai module de production** dans `Test.createTestingModule`, on injecte `DATABASE_DB` via le helper partagé `TestDatabaseModule`, et on récupère les services via `moduleRef.get(...)`.

```ts
import { Test, type TestingModule } from '@nestjs/testing';
import { TestDatabaseModule } from '@/test/setup/test-database.module';
import { TreasurerModule } from '../treasurer.module';

let moduleRef: TestingModule;
let treasurerService: TreasurerService;

beforeEach(async () => {
  tx = await globalThis.createTestTransaction();

  moduleRef = await Test.createTestingModule({
    imports: [TestDatabaseModule.forRoot(tx.db), TreasurerModule],
  }).compile();

  treasurerService = moduleRef.get(TreasurerService);
});

afterEach(async () => {
  await moduleRef?.close();
  await tx?.rollback();
});
```

Règles :

- **Importer le vrai module de prod** (`TreasurerModule`, `BroadcastModule`, etc.). Pas de wiring manuel `new XxxService(...)` à la main. Si le spec couvre plusieurs sous-systèmes, importer chaque module concerné.
- **Toujours `TestDatabaseModule.forRoot(tx.db)`** en premier dans `imports`, importé depuis `@/test/setup/test-database.module`. Ne jamais redéfinir le module inline dans le spec — c'est un helper partagé.
- **`await moduleRef.close()` dans `afterEach`** pour libérer les hooks de cycle de vie Nest (`onModuleDestroy`).
- **`moduleRef.get(XxxService)`** pour récupérer chaque service que le spec utilise (le SUT + ceux dont on a besoin pour des assertions directes).
- **Pas de `new XxxRepo(db)` ni `new XxxService(...)`** — si tu te retrouves à instancier à la main, c'est que tu as oublié un module dans `imports`.
- **`.overrideProvider(Adapter).useValue(...)` UNIQUEMENT pour les adapters d'unmanaged deps** (Discord, Stripe sans sandbox). Jamais pour un Monitor, jamais pour un service métier, jamais pour un repo.

### 4. Transaction rollback par test, jamais réutilisée entre sections

Pattern obligatoire `beforeEach` / `afterEach` :

```ts
describe('Foo — Integration', () => {
  let tx: TestTransaction;
  let moduleRef: TestingModule;
  let db: NodePgDatabase;
  let sut: FooService;

  beforeEach(async () => {
    tx = await globalThis.createTestTransaction();
    db = tx.db;
    moduleRef = await Test.createTestingModule({
      imports: [TestDatabaseModule.forRoot(tx.db), FooModule],
    }).compile();
    sut = moduleRef.get(FooService);
  });

  afterEach(async () => {
    await moduleRef?.close();
    await tx?.rollback();
  });

  it('...', async () => {
    /* ... */
  });
});
```

Pourquoi rollback et pas truncate :

- Isolation forte entre tests sans payer le coût d'un truncate (qui casserait les seeds).
- Le seed (`afters.sql`) appliqué une fois au startup reste intact.
- Si un test crashe, la transaction est abandonnée, l'état est intact pour le test suivant.

Limite à connaître : la transaction de test **partage la même connexion PG**. Si le code sous test ouvre sa propre transaction imbriquée (savepoint), c'est OK. Mais s'il crée une connexion séparée (pool indépendant), elle ne verra **pas** les données de la transaction de test → c'est un bug à corriger côté code (faire passer la transaction explicitement).

### 5. Longest happy path d'abord, edge cases ensuite (Khorikov 8.1.3)

Pour chaque scénario métier, structurer la suite en deux groupes :

```ts
describe('Campaign submission — Integration', () => {
  describe('happy path', () => {
    it('crée une campagne en DRAFT, fund le ledger, transfère au submit, log un événement', async () => {
      // Le SEUL test qui traverse tout : create → update budget → submit → balance vérifié
    });
  });

  describe('edge cases', () => {
    it('rejette submit si budget < minimum', async () => {
      /* ... */
    });
    it('rejette submit si organization sous-fundée', async () => {
      /* ... */
    });
    it('rollback la transaction et restore les balances si une étape échoue', async () => {
      /* ... */
    });
  });
});
```

- **Happy path = un seul test** qui traverse toutes les out-of-process deps du scénario.
- **Edge cases** = un test par chemin alternatif qui ne peut **pas** être prouvé en unit test (parce qu'il dépend de la DB, d'un trigger, d'une contrainte, d'une condition de concurrence, etc.).
- **Ne pas tester les edge cases qui fail-fast** : si une précondition vérifiée dans le code throw immédiatement et que l'app crash safely, c'est suffisant — pas besoin d'un test d'intégration dédié.

### 6. Concentrer sur la logique qui peut échouer (instruction utilisateur)

Le but n'est PAS de tester chaque ligne. C'est de tester ce qui peut casser de façon non triviale :

**Haute valeur** (tester systématiquement) :

- Transitions de state machines (Campaign DRAFT → PENDING → SCHEDULED → ACTIVE).
- Atomicité financière (transfer entre ledgers, race conditions sur les balances, idempotency).
- Contraintes DB (FK, unique, NOT NULL, check constraints).
- Matviews / triggers / fonctions Postgres (analytics, reach, scoring).
- Side effects multi-tables (un endpoint qui modifie 3+ tables doit prouver les 3 modifications).
- Race conditions reproductibles (deux requêtes concurrentes sur la même ressource).
- Jobs BullMQ end-to-end (data IN → processor → DB state OUT).

**Basse valeur** (NE PAS perdre du temps dessus) :

- Un service qui fait `return this.repo.create(dto)` — couvert transitivement.
- Un repo qui fait `db.select().from(table).where(eq(...))` — couvert transitivement via tout autre test qui passe par lui.
- Le mapping DTO → entity quand c'est un `...spread` trivial.
- La lecture seule simple (`GET /entity/:id`) — Khorikov 10.5.1 : tester les writes en priorité, les reads seulement quand le mapping est complexe.

### 7. Asserts indépendants de l'input (Khorikov Ch. 8 et 10)

Dans l'assert, **relire la DB via le repo**, ne pas faire confiance à l'output de la méthode testée :

```ts
// ❌ Trop faible — on assert la valeur qu'on a passée en input
const created = await service.create({ name: 'X', budget: 100 });
expect(created.name).toBe('X'); // tautologie
expect(created.budget).toBe(100); // tautologie

// ✅ On va lire la DB pour vérifier que c'est bien persisté
await service.create({ name: 'X', budget: 100 });
const fromDb = await db
  .select()
  .from(campaign)
  .where(eq(campaign.name, 'X'))
  .then((r) => r[0]);
expect(fromDb).toBeDefined();
expect(fromDb.budget).toBe(100);
expect(fromDb.status).toBe(CampaignStatus.DRAFT); // valeur dérivée, vraie info
```

Khorikov : "It's important to check the state of the database independently of the data used as input parameters."

### 8. Vérifier les calls aux mocks unmanaged (Khorikov 9.2.3)

Pour chaque dépendance unmanaged mockée, vérifier **les deux** :

```ts
// Existence des appels attendus
expect(discordMock.sendMessage).toHaveBeenCalledTimes(1);
expect(discordMock.sendMessage).toHaveBeenCalledWith({
  channelId: 'ch-1',
  content: expect.stringContaining('your ad'),
});

// Absence des appels inattendus
expect(discordMock.deleteMessage).not.toHaveBeenCalled();
```

Les `*Monitor` ne sont **pas** mockés (ils tournent en vrai via la DI Nest), donc on n'a rien à vérifier dessus côté test — ils font du Logger / structlog interne, leurs effets de bord ne sortent pas du process.

### 9. Pas de banderoles ASCII, pas d'emoji, pas de commentaires décoratifs

Voir `rules/fix-format-no-decorative-comments.md`. Les blocs `// ─── X ───────────` sont bannis. Le code se structure via `describe`/`it` et fonctions nommées, pas via des banderoles.

</rules>

<process>

## Procédure quand on te demande "écris un test d'intégration pour X"

### Étape 1 — Identifier le scénario et ses dépendances out-of-process

1. **Lis le code de X** : controller, application service, processor BullMQ, ou state machine.
2. **Liste les out-of-process deps** que le scénario touche :
   - DB (toujours, sauf code purement orchestration sans persistance).
   - Redis / BullMQ Queue ? Discord SDK ? Stripe ? Autres APIs HTTP ?
3. **Classifie** chaque dep en managed (DB, Redis/BullMQ) / unmanaged (Discord, Stripe, HTTP tiers).
4. **Pour chaque unmanaged dep avec sandbox dispo (Stripe, etc.)** : pose la question à l'utilisateur avant d'écrire.

### Étape 2 — Inventorier les fixtures nécessaires

1. Liste les entités créées par le scénario (Advertiser, Campaign, Ledger, etc.).
2. Pour chaque entité, vérifie qu'une fixture existe : `find src -name "<entity>.fixture.ts"`.
3. **Si une fixture manque** : la créer **avant** d'écrire le spec. C'est un livrable séparé du spec.
4. Si une fixture existe mais ne supporte pas un override dont on a besoin (`status`, `budget`, etc.), **étendre la fixture** plutôt que faire un INSERT à la main dans le spec.

### Étape 3 — Construire le `TestingModule` Nest

1. Identifier le module de prod qui expose le SUT (`TreasurerModule`, `BroadcastModule`, etc.).
2. Importer le helper partagé : `import { TestDatabaseModule } from '@/test/setup/test-database.module'`. Ne pas le redéfinir inline.
3. Dans `beforeEach`, `Test.createTestingModule({ imports: [TestDatabaseModule.forRoot(tx.db), SomeModule] }).compile()`.
4. Pour les adapters d'unmanaged deps (Discord, Stripe sans sandbox) → `.overrideProvider(XxxAdapter).useValue({ ... })`.
5. Récupérer les services via `moduleRef.get(XxxService)` — uniquement ceux dont le test a besoin.
6. `await moduleRef?.close()` en `afterEach` AVANT le `tx.rollback()`.

### Étape 4 — Écrire les tests dans cet ordre

1. **Happy path** : un seul test, le scénario complet. Arrange (fixtures) → Act (1 appel SUT) → Assert (lectures DB + vérif mocks).
2. **Edge cases** (un par chemin alternatif non-fail-fast).
3. **Concurrency / race conditions** quand pertinent (deux promesses parallèles, attendre `Promise.allSettled`, vérifier l'invariant final).

Pour chaque test :

- Une seule section `Act` (Khorikov 8.5.4). Pas d'enchaînement `act → assert → act → assert` sauf si Act déclenche un job asynchrone qu'il faut attendre.
- Pas de `try/catch` qui swallow une erreur. Utiliser `await expect(...).rejects.toThrow(...)`.
- Pas de logique conditionnelle dans le test (`if` sur des booléens). Si tu en as besoin, c'est deux tests différents.

### Étape 5 — Asserts en couches

Ordre des asserts (du plus large au plus précis) :

1. **Status / return value** du SUT (rapide, élimine les bugs grossiers).
2. **État DB des entités principales** via leur repo ou via `db.select()`.
3. **État DB des entités liées** (FK enfants, ledger balances, transfers, etc.).
4. **Calls aux mocks unmanaged** : présence + absence.

### Étape 6 — Lancer et valider

Commandes obligatoires avant de déclarer "fait" :

```bash
bun test <path-to-spec> --timeout 60000
bun run typecheck
bun run check:fix
```

Si l'un échoue avec une erreur **causée par notre code** → corriger immédiatement.
Si l'un échoue avec une erreur **pré-existante** (sur des fichiers que nous n'avons pas touchés) → la remonter explicitement à l'utilisateur (voir `rules/fix-process-flag-existing-warnings.md`).

### Étape 7 — Checklist avant "fait"

- [ ] Toutes les entités créées via fixture (zéro INSERT manuel dans le spec).
- [ ] DI Nest via `Test.createTestingModule({ imports: [...] })` (zéro `new XxxService(...)` à la main, zéro stub d'un service ou repo interne, zéro mock de Monitor).
- [ ] `TestDatabaseModule.forRoot(tx.db)` `@Global()` en premier dans `imports`, fournit `DATABASE_DB` scopé à la transaction de test.
- [ ] `.overrideProvider(...)` UNIQUEMENT pour les adapters d'unmanaged deps (Discord, Stripe) — pas pour les Monitor, pas pour les services internes, pas pour les repos.
- [ ] Si une unmanaged dep avec sandbox est en jeu : choix sandbox/mock validé par l'utilisateur.
- [ ] `beforeEach` ouvre une transaction + compile le module, `afterEach` close le module + rollback la transaction.
- [ ] Un happy path qui traverse toutes les out-of-process deps du scénario.
- [ ] Edge cases ciblés sur ce qui **peut casser** (pas un test par méthode).
- [ ] Asserts indépendants de l'input (relectures DB).
- [ ] Vérifications `toHaveBeenCalled` + `not.toHaveBeenCalled` pour chaque mock unmanaged.
- [ ] Le spec passe : `bun test <path> --timeout 60000`.
- [ ] `bun run typecheck` passe.
- [ ] `bun run check:fix` ne fait aucun fix sur le nouveau fichier.

</process>

<antipatterns>

## Antipatterns à fuir

### Le test qui stub un service interne pour "isoler"

```ts
// ❌ On stub StreamService pour que BillingService trouve "le bon stream"
const streamServiceStub = { findById: jest.fn(async () => fakeStream) };
const billing = new BillingService(/* ... */, streamServiceStub as any, /* ... */);
```

→ Ne prouve rien sur le vrai comportement. Crée un vrai stream via `StreamFixture` et laisse le vrai `StreamService` être résolu par la DI Nest. Si compiler `BroadcastModule` est trop lourd, c'est qu'il faut **alléger le module**, pas contourner la DI.

### Le test qui mock le SDK tiers brut

```ts
// ❌ Mock direct de discord.js
jest.mock('discord.js', () => ({/* ... */}));
```

→ Khorikov 9.2.4 : "Only mock types you own". Passer par notre `DiscordService` adapter, mocker l'adapter.

### Le test qui lit la DB sans repo

```ts
// ❌ Requête SQL inline dans l'assert
const rows = await db.execute(
  sql.raw(`SELECT * FROM campaign WHERE id = '${id}'`),
);
```

→ Couplage au schéma + risque SQL injection. Utiliser le repo (`campaignRepo.findById(id)`) ou la table Drizzle (`db.select().from(campaign).where(eq(campaign.id, id))`).

### Le test qui assert sur ce qu'il vient de passer en input

```ts
const created = await service.create({ name: 'X' });
expect(created.name).toBe('X'); // tautologie
```

→ Lis la DB indépendamment, ou assert sur les valeurs **dérivées** (status par défaut, FK auto-créées, timestamps, etc.).

### Le mega-test qui enchaîne 5 actions

```ts
// ❌ act → assert → act → assert → act → assert
it('full lifecycle', async () => {
  const c = await create();
  expect(c.status).toBe('DRAFT');
  await update(c.id, { budget: 100 });
  await submit(c.id);
  expect(...).toBe('PENDING');
  await approve(c.id);
  // ...
});
```

→ Khorikov 8.5.4 : multiple acts seulement si l'arrange est trop coûteux (sandbox tiers lent). Pour notre stack PG + rollback rapide, **un test = un Act**. Split en `it('submit transitionne en PENDING')`, `it('approve transitionne en SCHEDULED')`, etc.

### Le test des "reads" basiques

```ts
// ❌ Spec qui teste GET /campaign/:id avec une fixture et un assert d'égalité
it('returns the campaign by id', async () => {
  const c = await CampaignFixture.create(db);
  const found = await service.findById(c.id);
  expect(found.id).toBe(c.id);
});
```

→ Khorikov 10.5.1 : les reads simples ont une **valeur faible**. Ne pas écrire de spec dédié pour eux ; ils sont couverts transitivement par les specs de write. À tester uniquement quand la lecture fait quelque chose de **non trivial** (jointure complexe, agrégation, matview, etc.).

### La fixture qui appelle un service du domaine

```ts
// ❌ Fixture qui passe par un service métier
export class CampaignFixture {
  static async create(db, services) {
    return services.campaignService.create(advertiserId, dto);
  }
}
```

→ La fixture devient couplée à la chaîne complète de services et peut casser pour des raisons orthogonales au test. La fixture doit **bypass le domaine** et écrire directement en DB pour mettre le système dans l'état souhaité. Si on a besoin du side effect du service (ex: un advertiser funded), c'est un **helper local au spec** qui orchestre `AdvertiserFixture.create()` + `treasurerService.createDeposit()`.

### Le test qui mock pour faire passer Stripe

```ts
// ❌ Mock du SDK Stripe sans avoir vérifié si on peut sandbox
const stripeMock = {
  paymentIntents: { create: jest.fn().mockResolvedValue({ id: 'pi_x' }) },
};
```

→ Stripe a un Test Mode officiel. **Toujours demander à l'utilisateur** : sandbox réelle ou mock pour ce test ?

</antipatterns>

<examples>

## Bon exemple : treasurer (référence DI dans le projet)

Référence : [src/modules/app/shared/finance/treasurer/specs/treasurer.integration.spec.ts](../../../src/modules/app/shared/finance/treasurer/specs/treasurer.integration.spec.ts)

Pourquoi c'est bon :

- `Test.createTestingModule({ imports: [TestDatabaseModule.forRoot(tx.db), TreasurerModule] })` — vrai module de prod compilé, vraie DI.
- Zéro mock — les `*Monitor` tournent en vrai (Logger Nest, pas d'effet externe).
- `moduleRef.get(TreasurerService)` + `moduleRef.get(WithdrawService)` pour les services dont les tests ont besoin.
- `await moduleRef.close()` puis `await tx.rollback()` dans l'`afterEach`.
- 38 tests qui exercent ledger lifecycle, deposits, charges, withdraws, transfers (avec idempotency), repatriation, deep balance, history.

Les autres specs d'intégration historiques du projet (`broadcast-lifecycle`, `campaign-lifecycle`, `billing`, `credit-organization`) utilisent encore le wiring manuel `wireServices(db)` avec des `Proxy noop` sur les monitors — c'est le **pattern obsolète** à éliminer. Quand tu modifies un de ces specs ou qu'un nouveau scénario s'y ajoute, **migre le spec vers la DI Nest** dans la foulée.

## Squelette type pour un nouveau spec

```ts
import { Test, type TestingModule } from '@nestjs/testing';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { TestDatabaseModule } from '@/test/setup/test-database.module';
import type { TestTransaction } from '@/test/setup/test-init';
// ... imports fixtures, models, services, FooModule, DiscordService

describe('Foo scenario — Integration', () => {
  let tx: TestTransaction;
  let db: NodePgDatabase;
  let moduleRef: TestingModule;
  let sut: FooService;
  let discordAdapter: { sendMessage: jest.Mock; deleteMessage: jest.Mock };

  beforeEach(async () => {
    tx = await globalThis.createTestTransaction();
    db = tx.db;

    discordAdapter = {
      sendMessage: jest
        .fn()
        .mockResolvedValue({ id: `msg-${Date.now()}`, channelId: 'ch-1' }),
      deleteMessage: jest.fn().mockResolvedValue(undefined),
    };

    moduleRef = await Test.createTestingModule({
      imports: [TestDatabaseModule.forRoot(tx.db), FooModule],
    })
      // .overrideProvider UNIQUEMENT pour les unmanaged deps sans sandbox.
      // Le reste — services, repos, Monitor — passe par la vraie DI.
      .overrideProvider(DiscordService)
      .useValue(discordAdapter)
      .compile();

    sut = moduleRef.get(FooService);
  });

  afterEach(async () => {
    await moduleRef?.close();
    await tx?.rollback();
  });

  describe('happy path', () => {
    it('exécute le scénario complet et persiste tous les side effects', async () => {
      // Arrange (fixtures uniquement)
      const advertiser = await AdvertiserFixture.create(db);
      // ...

      // Act (un seul appel)
      const result = await sut.execute(/* ... */);

      // Assert — return value
      expect(result.status).toBe(ExpectedStatus.DONE);

      // Assert — état DB (relectures indépendantes)
      const persisted = await db
        .select()
        .from(fooTable)
        .where(eq(fooTable.id, result.id))
        .then((r) => r[0]);
      expect(persisted).toBeDefined();
      expect(persisted.derivedField).toBe(expectedDerivedValue);

      // Assert — calls à l'adapter Discord (unmanaged → vérification du contrat)
      expect(discordAdapter.sendMessage).toHaveBeenCalledTimes(1);
      expect(discordAdapter.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({ channelId: 'ch-1' }),
      );
      expect(discordAdapter.deleteMessage).not.toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('rollback toute la transaction métier si Discord throw', async () => {
      const advertiser = await AdvertiserFixture.create(db);
      discordAdapter.sendMessage.mockRejectedValueOnce(
        new Error('discord 5xx'),
      );

      await expect(sut.execute(/* ... */)).rejects.toThrow();

      // La donnée métier ne doit pas avoir été créée
      const rows = await db.select().from(fooTable);
      expect(rows).toHaveLength(0);
    });
  });
});
```

</examples>

<output_format>

Quand l'utilisateur demande "écris un test d'intégration pour X" :

1. **Classifier les out-of-process deps** de X en managed / unmanaged. Lister explicitement.
2. **Pour chaque unmanaged dep avec sandbox disponible** (Stripe en tête) : poser la question à l'utilisateur (sandbox vs mock pour ce test) avant d'écrire.
3. **Vérifier l'existence des fixtures** pour chaque entité du scénario. Lister celles à créer s'il en manque.
4. **Proposer un plan court** (≤ 10 lignes) : happy path à couvrir + edge cases identifiés + fixtures à créer/étendre + mocks à l'edge.
5. **Créer les fixtures manquantes** si besoin (commit séparé recommandé si non trivial).
6. **Compiler le module de prod** via `Test.createTestingModule({ imports: [TestDatabaseModule.forRoot(tx.db), SomeModule] })` + éventuellement `.overrideProvider(Adapter).useValue(...)` pour les unmanaged sans sandbox. Récupérer les services via `moduleRef.get(...)`.
7. **Écrire le spec** en suivant la checklist `<process>`.
8. **Lancer** : `bun test <path> --timeout 60000`.
9. **Valider** : `bun run typecheck && bun run check:fix`.
10. **Rapporter** : nombre de tests, scénarios couverts, fixtures créées/étendues, deps unmanaged mockées (et lesquelles, à quel niveau).

</output_format>
