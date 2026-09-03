---
name: architecture-module-conventions
description: 'Conventions d''architecture pour créer ou modifier un module dans un backend NestJS. Déclenché quand l''utilisateur demande "créer un module", "scaffold un module", "ajouter un controller", "ajouter un repo", "ajouter un cron / un job / un service", quand un nouveau fichier `*.module.ts` / `*.controller.ts` / `*.repo.ts` / `*.service.ts` / `*.cron.ts` / `*.processor.ts` est créé, ou quand une question d''organisation se pose (où mettre ce fichier, comment splitter ce service, faut-il un helper, faut-il un controller, faut-il un module séparé). Pose le contrat strict : layout de dossiers déterministe (controllers / docs / models / validators / repos / services + sous-dossiers helpers/monitors / crons / jobs / specs), naming `<entity>.xxx.ts` jamais `<module>-<feature>.service.ts`, organisation de la couche données selon les bonnes pratiques de l''ORM en usage (Drizzle, TypeORM, Prisma…), jobs barrel sans processor exporté (si queue type BullMQ), repos = seul endroit qui touche l''ORM, services qui ne dépendent que des services exportés par d''autres modules (jamais des repos d''autres modules), doc Swagger obligatoire (`docs/commons/` + `docs/endpoints/`) avec un fichier d''erreur par code d''erreur pouvant remonter.'
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

<objective>
Garantir que chaque module ajouté ou modifié dans un backend NestJS respecte une organisation déterministe : un fichier sait à l'avance où il doit aller, comment il doit s'appeler, ce qu'il a le droit d'importer, et ce qu'il doit exporter.

Trois objectifs concrets :

1. **Aucune dépendance circulaire** — le graphe d'imports est acyclique sans avoir besoin de `forwardRef`. Quand un `forwardRef` apparaît, c'est un signal qu'un troisième module manque ou qu'un import vise la mauvaise couche.
2. **Un seul endroit pour chaque responsabilité** — un `*.service.ts` orchestre, un `*.repo.ts` parle à la DB (via l'ORM), un `*.helper.ts` est pur, un `*.cron.ts` est un scheduler, un `*.processor.ts` consomme une queue, un `*.monitor.ts` est un sink d'observabilité. Pas d'hybride.
3. **Naming sans préfixe redondant** — on n'écrit jamais `payment-code.service.ts` à côté de `payment.service.ts`. Soit le code est dans le service principal, soit il vit dans `services/helpers/code.service.ts`. Le nom du dossier porte déjà le préfixe.

Si l'utilisateur demande quelque chose qui sort de ce layout (un service à la racine du projet, un repo qui appelle un service, un doc inline dans le controller), **proposer la version conforme** avant d'écrire — ce skill est un garde-fou.

> **Portabilité.** Ce skill est générique pour tout backend NestJS. Il décrit des conventions de structure, pas un stack figé. Les choix d'outils (ORM, système de queue, gestionnaire de paquets, décorateur de module custom) sont présentés comme **paramétrables** : adapte les exemples au stack réel du projet, et quand un point dépend d'un outil précis (organisation des modèles selon l'ORM, registre de queue), va lire la doc officielle de cet outil avant de trancher.
> </objective>

<scope>

## Quand ce skill s'applique

- Création d'un **nouveau module** dans l'arborescence de modules du projet (souvent `src/modules/<domaine>/<module>/`).
- Ajout d'un **fichier** dans un module existant : controller, doc, model, dto, repo, service, helper, monitor, cron, processor, spec, fixture.
- Question d'organisation sur un fichier existant : "où ce code devrait-il vivre ?", "ce service devrait-il être splitté ?", "ce repo a-t-il sa place dans ce module ?".
- Refactor d'un module qui dérive du layout (fichier nommé `<module>-<feature>.service.ts`, doc inline dans le controller, repo qui importe un service, etc.).

## Quand ce skill NE s'applique PAS

- Écriture d'un test d'intégration → déléguer au skill de tests d'intégration du projet s'il existe.
- Écriture d'un test unitaire → déléguer au skill de tests unitaires du projet s'il existe.
- Création d'une migration → suivre les bonnes pratiques de l'ORM (toujours générer la migration via l'outil de l'ORM, jamais de SQL manuel si l'outil sait le générer). Voir [process].
- Décision pure produit (faut-il créer cette fonctionnalité, quel code d'erreur retourner) → hors scope.

</scope>

<module_layout>

## Layout canonique d'un module

Tous les modules suivent ce squelette. **Aucun dossier ou fichier ne se crée à un autre emplacement** sans justification explicite. La racine exacte (`src/modules/...`, `src/app/...`, etc.) dépend du projet — adopte celle déjà en place.

```
<racine-modules>/<domaine>/<module>/
├── <module>.module.ts             ← @Module (ou décorateur de module custom), point d'entrée DI
├── controllers/                   ← uniquement si le module expose du HTTP
│   ├── <module>.controller.ts
│   └── index.ts
├── docs/                          ← compagnon obligatoire de controllers/
│   ├── index.ts                   ← re-export commons + endpoints
│   ├── commons/
│   │   ├── index.ts
│   │   ├── responses/             ← shapes de succès réutilisables
│   │   ├── errors/                ← UN fichier par code d'erreur pouvant remonter
│   │   ├── params/                ← path/query params réutilisables
│   │   └── bodies/                ← request bodies réutilisables
│   └── endpoints/
│       ├── index.ts
│       └── <verb>-<thing>.doc.ts  ← UN fichier par route, compose commons
├── models/                        ← schéma / entités de l'ORM (voir [circular_dependencies])
│   ├── index.ts
│   └── <entity>.model.ts          ← définition de table/entité + enums + types
├── validators/                    ← DTOs (class-validator + @ApiSchema)
│   ├── <module>.dto.ts            ← Request DTOs ET Response DTOs ensemble
│   └── index.ts
├── repos/                         ← couche d'accès DB (le SEUL endroit qui touche l'ORM)
│   └── <entity>.repo.ts           ← un repo par table principale, jamais par sous-feature
├── services/
│   ├── <module>.service.ts        ← service principal (orchestrateur)
│   ├── helpers/                   ← sous-services à responsabilité étroite
│   │   ├── index.ts
│   │   ├── <thing>.helper.ts      ← fonctions pures, AUCUNE DI ni I/O
│   │   ├── <thing>.service.ts     ← @Injectable, dépendances via constructor
│   │   └── specs/                 ← specs unitaires des helpers purs
│   │       └── <thing>.helper.spec.ts
│   └── monitors/                  ← sinks d'observabilité (logger structuré)
│       └── <module>.monitor.ts
├── crons/                         ← OPTIONNEL — tâches planifiées (si @nestjs/schedule)
│   ├── <verb>.cron.ts             ← une classe par cron, @Cron
│   └── index.ts
├── jobs/                          ← OPTIONNEL — producers + processors d'une queue (ex: BullMQ)
│   ├── index.ts                   ← producer-safe barrel (n'évalue PAS le @Processor)
│   ├── constants.ts               ← noms de queues, importable côté producer
│   ├── domains/interfaces/        ← types JobData / JobResult, importables côté producer
│   ├── <queue>-queue.module.ts    ← enregistrement de la queue centralisé
│   └── <verb>-<thing>.processor.ts ← @Processor, importé uniquement côté worker
└── specs/                         ← tests d'intégration + fixtures
    ├── <entity>.fixture.ts
    └── <module>.integration.spec.ts
```

### Règle d'or sur le layout

- **Pas de fichier orphelin à la racine du module** sauf `<module>.module.ts`. Tout autre fichier vit dans un des sous-dossiers ci-dessus.
- **Pas de dossier ad-hoc** (`utils/`, `lib/`, `core/`, `shared/`, etc.). Si un fichier ne rentre pas dans le layout, c'est qu'on essaie de mettre quelque chose au mauvais endroit — soit c'est un helper (→ `services/helpers/`), soit ça mérite un module à part.
- **Aucun module sans `<module>.module.ts`**. Le simple fait de créer un dossier ne fait rien sans le module NestJS.
- **`crons/` et `jobs/` sont optionnels** : on ne les crée que si le module planifie des tâches (`@nestjs/schedule`) ou produit/consomme une queue (BullMQ ou équivalent). Un module HTTP pur n'a ni l'un ni l'autre.
- **Le nom du dossier `models/`** suit la convention de l'ORM si elle diffère (ex: `entities/` côté TypeORM). Garde la cohérence avec le reste du projet.

</module_layout>

<module_organization>

## Organisation du module : les providers ont des rôles sémantiques

NestJS expose un `@Module({ imports, controllers, providers, exports })`. Même si tout finit techniquement dans `providers`, on **range mentalement les providers par rôle** et on garde cet ordre stable dans la déclaration. Chaque rôle a une signification — ne jamais traiter un cron comme un service ordinaire, ni un repo comme un orchestrateur.

```ts
import { Module } from '@nestjs/common';

@Module({
  imports: [OtherModuleA, OtherModuleB], // modules tiers exposant des services / config dynamique
  controllers: [XxxController], // exposés UNIQUEMENT si le module fait du HTTP
  providers: [
    // repos — couche DB
    XxxRepo,
    YyyRepo,
    // services — orchestrateurs + helpers @Injectable
    XxxService,
    XxxHelperService,
    // monitors — logger / telemetry
    XxxMonitor,
    // crons — schedulers (si @nestjs/schedule)
    XxxCron,
    // processors — workers de queue (si BullMQ)
    XxxJobProcessor,
  ],
  exports: [XxxService, XxxRepo], // surface publique minimale du module
})
export class XxxModule {}
```

### Décorateur de module custom (optionnel, spécifique au projet)

Certains projets remplacent `@Module` par un **décorateur custom** (ex: `@SmartModule`) qui ajoute des slots sémantiques typés (`repos`, `services`, `monitors`, `crons`, `processors`) et qui **active conditionnellement** les controllers vs les processors selon un mode de process (API vs worker, via une variable d'env type `APP_MODE`). Cela permet de splitter le binaire en deux instances (API + worker) sans dupliquer la déclaration.

- **Si le projet a un tel décorateur** → l'utiliser et ranger chaque provider dans le bon slot.
- **Sinon** → `@Module` standard, en gardant le découpage par rôle ci-dessus dans `providers`.

### Règles par rôle

| Rôle          | Contenu autorisé                                                                              | Erreur typique                                                                              |
| ------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `imports`     | Modules tiers (`XxxModule`) qui exportent ce dont on a besoin + config dynamique (queue, jwt) | Mettre un service / repo directement → c'est un provider local, pas un import               |
| `controllers` | `XxxController`                                                                               | Mettre un controller dans `providers`                                                       |
| repos         | `XxxRepo` qui n'expose **que** des méthodes de DB                                             | Y mettre un service qui orchestre plusieurs repos                                           |
| services      | Orchestrateur principal + helpers `@Injectable` du module                                     | Y mettre une fonction pure → c'est un `.helper.ts` consommé par un service, pas un provider |
| monitors      | Sinks d'observabilité (logger structuré, telemetry)                                           | Faire un service métier nommé `XxxMonitor` — un monitor n'a **pas** de logique métier       |
| crons         | Tâches planifiées (`@Cron` ou `SchedulerRegistry.addInterval`)                                | Mélanger la logique métier dans la classe cron au lieu de l'appeler depuis le service       |
| processors    | `@Processor(QUEUE_NAME)` (BullMQ ou équivalent)                                               | L'enregistrer sans condition de mode → il draine des jobs même en process API               |
| `exports`     | UNIQUEMENT ce qu'un autre module a besoin de DI                                               | Tout réexporter par défaut → augmente la surface publique, casse l'encapsulation            |

</module_organization>

<naming_rules>

## Naming des fichiers

Le préfixe du **dossier** porte déjà l'identité du module. Le nom du fichier décrit la **responsabilité**, pas le module.

### Règle de base : pas de `<module>-<feature>.xxx.ts`

```
<racine-modules>/payment/account/
├── services/
│   ├── payment.service.ts                     ✅ orchestrateur principal
│   └── helpers/
│       ├── code.service.ts                    ✅ helper @Injectable (DI sur CryptoService)
│       ├── code.helper.ts                      ✅ fonctions pures (extractPrefix, buildCode)
│       └── consent.service.ts                  ✅ helper @Injectable (DI sur un autre service)
```

```
<racine-modules>/payment/account/services/
├── payment-code.service.ts                     ❌ INTERDIT — préfixe redondant + pas dans helpers/
├── payment-consent-handler.service.ts          ❌ INTERDIT — préfixe redondant + suffixe vague
├── payment-utils.ts                            ❌ INTERDIT — pas de "utils", c'est `.helper.ts` dans helpers/
```

### Tableau de correspondance

| Fichier                                                            | Quand l'utiliser                                                                                                                 |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `<module>.module.ts`                                               | Toujours. Un seul par module.                                                                                                    |
| `<module>.controller.ts`                                           | Si le module expose du HTTP. Un seul controller par module — splitter en sous-modules sinon.                                     |
| `<verb>-<thing>.doc.ts`                                            | Un par route HTTP. Verbes : `create`, `get`, `update`, `delete`, `list`, `record`, `enroll`…                                     |
| `<entity>.model.ts`                                                | Un par table/entité de l'ORM. Inclut enums, définition de schéma, types `Xxx`/`NewXxx`. Convention du nom selon l'ORM.           |
| `<module>.dto.ts`                                                  | DTOs Request + Response groupés. Splitter en `<feature>.dto.ts` SEULEMENT si le module a plusieurs sous-features distinctes      |
| `<entity>.repo.ts`                                                 | Un par table principale. Si une table secondaire est manipulée uniquement à travers la table principale, **pas de repo séparé**. |
| `<module>.service.ts`                                              | Orchestrateur principal du module. Un seul.                                                                                      |
| `<thing>.service.ts` (dans `services/helpers/`)                    | Helper `@Injectable` à responsabilité étroite (code generation, consent check, scoring…)                                         |
| `<thing>.helper.ts`                                                | Fonctions pures, exportées named. Pas de classe, pas de DI, pas de `@Injectable`.                                                |
| `<module>.monitor.ts`                                              | Sink d'observabilité — méthodes qui acceptent un event métier et émettent log/telemetry. Pas de logique.                         |
| `<verb>.cron.ts`                                                   | Une classe par cron. Verbe = action (`confirm`, `reconcile`, `purge`, `start`, `expire`).                                        |
| `<verb>-<thing>.processor.ts`                                      | Un `@Processor` par queue (`create-notification.processor.ts`, `send-email.processor.ts`).                                       |
| `<queue>-queue.module.ts`                                          | Module dédié qui enregistre UNE queue partagée entre producer et consumer.                                                       |
| `<entity>.fixture.ts`                                              | Une classe statique avec `static async create(db, overrides?)`. Voir le skill de tests d'intégration.                            |
| `<module>.integration.spec.ts` ou `<scenario>.integration.spec.ts` | Spec d'intégration. Voir le skill de tests d'intégration.                                                                        |

### Cas spéciaux acceptables

- `<entity>-<sub-entity>.model.ts` quand une entité a un modèle compagnon **fortement couplé** qui ne mérite pas son propre module (ex: `payment-rate-history.model.ts` dans `account/models/`). Reste à côté du modèle parent.
- `<feature>.dto.ts` quand le module gère plusieurs ressources distinctes via le même controller (ex: stats avec `referrals` et `referrals-totals`). Ne pas confondre avec splitter par méthode.
- Suffixe de modèle imposé par l'ORM (ex: `<entity>.entity.ts` côté TypeORM) — suivre la convention de l'ORM plutôt que `.model.ts` si c'est ce que le projet utilise.

</naming_rules>

<documentation_swagger>

## Documentation Swagger (obligatoire dès qu'il y a un controller)

Chaque module avec un controller a un dossier `docs/` voisin. Le controller applique des décorateurs custom via `applyDecorators(...)`. Inline `@ApiOperation` / `@ApiResponse` dans le controller est **interdit**.

### Structure `docs/`

```
docs/
├── index.ts                    ← export * from './commons'; export * from './endpoints';
├── commons/
│   ├── index.ts                ← re-export responses / errors / params / bodies
│   ├── responses/
│   │   ├── index.ts
│   │   ├── <entity>-response.doc.ts          ← ApiResponse 200/201 + schema $ref
│   │   └── <entity>-list-response.doc.ts
│   ├── errors/
│   │   ├── index.ts
│   │   ├── <entity>-not-found.doc.ts         ← ApiResponse 404 + code d'erreur
│   │   ├── <entity>-forbidden.doc.ts         ← ApiResponse 403 + code d'erreur
│   │   ├── <entity>-conflict.doc.ts          ← ApiResponse 409 + code d'erreur
│   │   └── <entity>-validation-errors.doc.ts ← ApiResponse 400 + tous les codes de validation
│   ├── params/
│   │   ├── index.ts
│   │   └── <name>-param.doc.ts               ← ApiParam (path)
│   └── bodies/
│       ├── index.ts
│       └── <feature>-body.doc.ts             ← ApiBody (request body)
└── endpoints/
    ├── index.ts
    └── <verb>-<thing>.doc.ts                 ← UN par route, compose commons
```

### Pattern d'un fichier d'endpoint

Un fichier `<verb>-<thing>.doc.ts` est une **fonction qui retourne `applyDecorators(...)`**. Il agrège l'`ApiOperation` + tous les commons pertinents pour cette route.

```ts
// docs/endpoints/create-account.doc.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  AccountConflictDoc,
  AccountForbiddenDoc,
  AccountResponseDoc,
  UserIdParamDoc,
} from '../commons';

export const CreateAccountDoc = () => {
  return applyDecorators(
    ApiOperation({
      summary: 'Create account (idempotent)',
      description:
        'Creates an account, or returns the existing one if already ACTIVE. Requires prior consent on first call. Fails if DISABLED.',
    }),
    UserIdParamDoc(),
    AccountResponseDoc(),
    AccountForbiddenDoc(),
    AccountConflictDoc(),
  );
};
```

Utilisation côté controller :

```ts
@Put(':userId')
@CreateAccountDoc()
async create(@Param('userId', UUIDPipe) userId: string): Promise<AccountResponseDto> {
  return this.accountService.create(userId);
}
```

### Pattern d'un fichier de réponse

```ts
// docs/commons/responses/account-response.doc.ts
import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { AccountResponseDto } from '../../../validators/account.dto';

export const AccountResponseDoc = () => {
  return applyDecorators(
    ApiExtraModels(AccountResponseDto),
    ApiResponse({
      status: 200,
      description: 'Account',
      schema: { $ref: getSchemaPath(AccountResponseDto) },
    }),
  );
};
```

- `ApiExtraModels(Dto)` est obligatoire pour que Swagger UI résolve `$ref`.
- `description` court et concret — pas de remplissage marketing.

### Pattern d'un fichier d'erreur

```ts
// docs/commons/errors/account-not-found.doc.ts
import { ApiResponse } from '@nestjs/swagger';
import { ERROR_CODES } from '<racine>/constants/error-codes.constant';

export const AccountNotFoundDoc = () => {
  return ApiResponse({
    status: 404,
    description: 'Account not found',
    examples: {
      [ERROR_CODES.ACCOUNT_NOT_FOUND]: {
        summary: ERROR_CODES.ACCOUNT_NOT_FOUND,
        value: { statusCode: 404, message: ERROR_CODES.ACCOUNT_NOT_FOUND },
      },
    },
  });
};
```

> Adapte `ERROR_CODES` au registre de codes d'erreur du projet (constant, enum, etc.).

### Règles strictes

- **Un fichier d'erreur par code d'erreur potentiellement levé par cette route.** Si la route peut throw `ACCOUNT_NOT_FOUND` et `ACCOUNT_DISABLED`, il faut deux fichiers d'erreur référencés dans le doc d'endpoint, ou un fichier `account-forbidden.doc.ts` qui groupe les codes partageant le même status code (`403` avec plusieurs examples).
- **Aucun `@ApiResponse` inline dans le controller.** Si tu as besoin d'une réponse, elle vit dans `docs/commons/responses/`. Si tu as besoin d'une erreur, elle vit dans `docs/commons/errors/`.
- **Les `description` sont écrites pour le consommateur de l'API** (frontend, partenaire externe), pas pour nous. Préciser le contrat : ce qui est garanti, ce qui peut throw, ce qui est idempotent.
- **Les `examples` utilisent le registre de codes d'erreur** comme clé pour que Swagger affiche le bon discriminator.
- **Quand un endpoint a un body**, ajouter un `<feature>-body.doc.ts` dans `commons/bodies/` plutôt que de typer le `@Body()` sans `ApiBody`. Swagger ne dérive pas automatiquement le body depuis le type du paramètre dans tous les cas (notamment les unions, partials).

</documentation_swagger>

<services_organization>

## Organisation des services et helpers

### Principe : le service principal orchestre, les helpers exécutent

Le `<module>.service.ts` est un **orchestrateur** qui coordonne les helpers et les repos. Il ne contient pas la logique de bas niveau. Quand une méthode du service principal grossit :

1. **Identifier la sous-responsabilité** : génération de code, vérification de consent, calcul de pricing, etc.
2. **Extraire dans `services/helpers/<thing>.service.ts`** (si DI nécessaire) ou `services/helpers/<thing>.helper.ts` (si pur).
3. **Injecter le helper dans le service principal** via le constructor.

### `.service.ts` vs `.helper.ts` dans `services/helpers/`

| Aspect           | `.service.ts` (Injectable)                              | `.helper.ts` (fonctions pures)                           |
| ---------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| Décorateur       | `@Injectable()`                                         | Aucun                                                    |
| Forme            | Classe avec constructeur DI                             | Export named de fonctions pures                          |
| Dépendances      | Autres services / repos via DI                          | Aucune. Tout passe en paramètre.                         |
| I/O autorisé     | Oui (DB via repo, Crypto, HTTP via adapter)             | Non. Pure fonction.                                      |
| Testable         | Test d'intégration (DI réelle) ou unit test ciblé       | Unit test exclusivement                                  |
| Quand l'utiliser | Code qui dépend d'un repo, d'un SDK, d'une autre couche | Calcul, parsing, formatting, transformation déterministe |

### Exemple : module payment/account

```
services/
├── payment.service.ts              ← orchestrateur. DI : DB, PaymentRepo, CodeService,
│                                      ConsentService, autre service de domaine, UserRepo
└── helpers/
    ├── code.service.ts             ← @Injectable. DI : CryptoService. Méthode `generate(userName)`.
    ├── code.helper.ts              ← fonctions pures : extractPrefix(name), suffixLength(prefix),
    │                                  buildCode(name, suffixBytes), bytesToSuffix(buf).
    ├── consent.service.ts          ← @Injectable. DI : un service tiers + un repo.
    │                                  Méthode `hasAcceptedCurrentVersion(userId)`.
    ├── index.ts                    ← re-export
    └── specs/
        └── code.helper.spec.ts     ← unit tests des fonctions pures
```

### Quand splitter en sous-module plutôt qu'en helper

Sous-module séparé si **AU MOINS DEUX** vraies :

1. Le code a son propre cycle de vie / persistance (table dédiée, repo dédié, controller dédié).
2. Le code est réutilisé par **plusieurs modules différents** (et donc doit être exporté).
3. Le code a sa propre frontière de domaine (commission ≠ referral ≠ account dans `payment/`).

Sinon, helper dans `services/helpers/` suffit.

### Monitors

Un `*.monitor.ts` est un **sink d'observabilité**, pas un service métier. Il ne fait que :

- Recevoir des events typés du service principal (méthodes nommées `created()`, `expired()`, `confirmed()`, etc.)
- Émettre un log structuré (LoggerService) et / ou un point de telemetry futur

Il ne décide jamais quoi faire avec l'event. La logique reste dans le service.

```ts
@Injectable()
export class TransferMonitor {
  constructor(private readonly logger: LoggerService) {}

  created(transfer: Transfer, senderBalance: number, receiverBalance: number) {
    this.logger.log({
      msg: 'Transfer created',
      transferId: transfer.id,
      senderBalance,
      receiverBalance,
    });
  }
}
```

</services_organization>

<crons_and_jobs>

## Crons et Jobs

> `crons/` (via `@nestjs/schedule`) et `jobs/` (via une queue type BullMQ) sont **optionnels** : on ne les crée que si le module en a réellement besoin.

### Crons : `@Cron` par défaut, `setInterval` UNIQUEMENT si intervalle dynamique

```ts
// crons/confirm.cron.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LoggerService } from '<racine>/modules/core/logger';

@Injectable()
export class ConfirmCron {
  private readonly logger: LoggerService;

  constructor(loggerService: LoggerService /* repos / services */) {
    this.logger = loggerService.createChild(ConfirmCron.name);
  }

  @Cron(CronExpression.EVERY_5_MINUTES, { name: 'confirm' })
  async handleConfirm() {
    try {
      // ... logique (déléguée au service du module) ...
    } catch (error) {
      this.logger.error({ msg: 'Unhandled error', error });
    }
  }
}
```

Règles :

- **Nommer la job** (`name: 'confirm'`) pour pouvoir l'introspecter via `SchedulerRegistry`.
- **`try/catch` global** dans la méthode — un cron qui throw silencieusement disparaît, on veut un log d'erreur exploitable.
- **Constants au top-level** pour les `CronExpression` calculées depuis l'env (les décorateurs s'évaluent à l'import, avant la DI).
- **Une méthode publique par cron**, pas de helpers privés dans la même classe (sauf si vraiment trivial). Sortir la logique dans le service du module et appeler `this.xxxService.doIt()`.
- **Optionnel — split API/worker** : si le projet sépare le process API du process worker, désactiver le cron côté API avec `@Cron(expr, { name, disabled: process.env.APP_MODE !== 'worker' })` (ou l'équivalent du projet) pour qu'il ne s'enregistre que dans le worker.

Exception légitime à `@Cron` : intervalle qui dépend d'une dépendance injectée et qui n'est connu qu'à l'instanciation. Dans ce cas, `OnModuleInit` + `setInterval` + `SchedulerRegistry.addInterval(name, handle)`. Justifier en commentaire.

### Jobs (queue type BullMQ) : producer-safe barrel

> S'applique si le projet utilise un système de queue avec des processors décorés (ex: BullMQ via `@nestjs/bullmq`). Adapter au système réel.

Le piège classique : importer le `*.processor.ts` côté producer charge le décorateur `@Processor` qui s'enregistre auprès du registre de la queue et tente d'ouvrir une connexion worker. **Séparer strictement** :

```
jobs/
├── index.ts                          ← producer-safe : export queue module, constants, interfaces.
│                                       NE PAS exporter le `.processor.ts`.
├── constants.ts                      ← QUEUE_NAME, importable partout
├── domains/
│   └── interfaces/
│       └── <verb>-<thing>.interface.ts  ← JobData, JobResult
├── <queue>-queue.module.ts           ← enregistrement de la queue centralisé,
│                                       importé par producer ET consumer
└── <verb>-<thing>.processor.ts       ← @Processor, importé UNIQUEMENT par le module
                                        worker (via le slot/array `processors`)
```

Le `<queue>-queue.module.ts` :

```ts
@Module({
  imports: [BullModule.registerQueue(QueueConfiguration)],
  exports: [BullModule],
})
export class XxxQueueModule {}
```

Le `index.ts` du dossier `jobs/` :

```ts
// Producer-safe entry point.
// N'exporte PAS le processor : son @Processor décorateur s'évalue à
// l'import et déclenche des side effects (registre worker de la queue).
export * from './xxx-queue.module';
export * from './constants';
export * from './domains/interfaces/xxx.interface';
```

Côté `<module>.module.ts` consumer, le processor est importé **directement** depuis `./jobs/<verb>-<thing>.processor` :

```ts
import { CreateNotificationProcessor } from './jobs/create-notification.processor';

@Module({
  imports: [..., NotificationQueueModule],
  providers: [CreateNotificationProcessor],  // chargé uniquement côté worker si split API/worker
})
export class NotificationModule {}
```

Côté producer (autre module) :

```ts
import { NotificationQueueModule } from '<racine>/modules/notification/jobs';

@Module({
  imports: [..., NotificationQueueModule],  // récupère la Queue + types, PAS le processor
})
export class OrderModule {}
```

</crons_and_jobs>

<circular_dependencies>

## Éviter les dépendances circulaires

### Règle 1 : organiser la couche modèles selon l'ORM

La façon de déclarer les tables/entités et leurs relations **dépend de l'ORM**. Avant de scaffolder les modèles, **lis la documentation officielle de l'ORM en usage** pour savoir comment éviter les cycles d'import et organiser les fichiers :

- **Drizzle** → doc « Relations » / « Schema ». Le pattern recommandé sépare la définition de table de la déclaration des `relations()`. Voir l'exemple Drizzle ci-dessous.
- **TypeORM** → doc « Entities » / « Relations ». Les relations sont des décorateurs (`@OneToMany`, `@ManyToOne`) directement sur la classe entité ; les cycles se gèrent avec des fonctions de résolution paresseuse (`() => Other`) et le type `Relation<T>` pour casser les cycles de types.
- **Prisma** → le schéma est centralisé dans `schema.prisma`, le client est généré ; la problématique de cycles d'import TS ne se pose pas de la même façon.
- **Autre ORM** → consulter sa doc « relations / associations » avant de décider du découpage de fichiers.

La règle générale, quel que soit l'ORM : **un `.repo.ts` est le seul fichier qui importe et manipule les modèles/entités de l'ORM** (voir Règle 2), et le découpage des fichiers de modèles doit suivre la recommandation de l'ORM pour rester acyclique.

#### Exemple — **s'applique uniquement à Drizzle**

Drizzle `relations()` référence d'autres tables qui elles-mêmes ont leurs propres relations. Si on déclare tout dans un seul fichier, on a vite un cycle import `A → B → A`. Le pattern Drizzle : **split `.model.ts` (table autonome) + `.relations.ts` (relations, importe les autres modèles)**.

```ts
// [Drizzle uniquement] models/account.model.ts — autonome, ne référence pas d'autres modèles
export const account = pgTable('account', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => user.id), // FK simple, OK
  ledgerId: uuid('ledger_id').references(() => ledger.id),
  // ...
});
export type Account = typeof account.$inferSelect;
```

```ts
// [Drizzle uniquement] models/account.relations.ts — séparé, importe d'autres modèles
import { relations } from 'drizzle-orm';
import { user } from '<racine>/modules/users/user/models/user.model';
import { ledger } from '...';
import { account } from './account.model';

export const accountRelations = relations(account, ({ one, many }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
  ledger: one(ledger, { fields: [account.ledgerId], references: [ledger.id] }),
  // ...
}));
```

> **[Drizzle uniquement]** Toujours créer le `.relations.ts` séparé, même si on n'utilise pas encore les relations dans des queries. Quand on en aura besoin, ajouter dedans ne casse rien. Ce split est une particularité de Drizzle — il ne s'applique pas à TypeORM (relations sur l'entité) ni à Prisma (schéma centralisé).

### Règle 2 : repos n'importent QUE des modèles/entités

```ts
// ✅ OK
import { commission } from '../models/commission.model';
import { order } from '<racine>/modules/orders/order/models/order.model';

// ❌ INTERDIT — un repo n'importe jamais un service
import { CommissionService } from '../services/commission.service';
```

Un repo qui aurait besoin d'un service signale un mauvais découpage : la logique appartient au service appelant, pas au repo.

### Règle 3 : services n'importent JAMAIS un repo d'un autre module

```ts
// ✅ OK — on dépend du service de l'autre module
import { PaymentService } from '<racine>/modules/shared/finance/payment';

// ❌ INTERDIT — on shortcut le module
import { TransferRepo } from '<racine>/modules/shared/finance/payment/core/transfer/repos/transfer.repo';
```

Le module fournisseur **décide ce qu'il expose** via son slot `exports`. Si tu as besoin d'une méthode qui n'existe pas, **demander d'ajouter la méthode au service** plutôt que contourner. Corollaire : un service ne touche jamais l'ORM directement (`db.update(...)`) — il passe par un repo.

### Règle 4 : `forwardRef` est un signal d'alerte, pas une solution

Quand `XxxModule` et `YyyModule` ont chacun besoin de l'autre, c'est qu'il manque souvent un `ZzzModule` qui exporte le concept partagé. Cas typique :

- `OrderModule` a besoin de `SchedulerModule` pour planifier.
- `SchedulerModule` a besoin de `OrderModule` pour annuler les tâches d'un order supprimé.

Plutôt qu'un `forwardRef`, extraire un troisième module (`OrderSchedulerModule`) qui contient juste le scheduler partagé. Si l'extraction est trop coûteuse pour la PR en cours, **documenter le `forwardRef` en commentaire** avec un TODO et créer un follow-up.

### Règle 5 : `index.ts` de barrel, AUCUN side effect

Un fichier `index.ts` de barrel **re-export uniquement**. Aucun code qui s'exécute, aucun import d'un fichier qui s'exécute. C'est pour ça que `jobs/index.ts` n'exporte **pas** le processor (qui a un side effect via le décorateur `@Processor`).

</circular_dependencies>

<imports_discipline>

## Discipline d'imports : importer le minimum nécessaire

### Règle 1 : ne jamais importer "au cas où"

Si on n'utilise pas le type, le service, le helper — ne pas l'importer. Le linter / TypeScript le détectent, mais c'est un signal qu'il faut **interroger l'utilité** plutôt que supprimer l'import : "pourquoi j'ai pensé que j'en avais besoin ?".

### Règle 2 : path imports absolus pour tout ce qui sort du module courant

Utilise l'alias de chemin configuré dans le `tsconfig.json` du projet (souvent `@/...` ou `src/...`) pour tout ce qui sort du module, et des imports relatifs **dans** le module courant.

```ts
// ✅ — alias absolu depuis racine src/
import { ERROR_CODES } from '@/constants/error-codes.constant';
import { PaymentService } from '@/modules/shared/finance/payment';

// ✅ — relatif pour les fichiers DANS le module courant
import { AccountRepo } from '../repos/account.repo';
import { CodeService } from './helpers/code.service';

// ❌ — relatif qui sort du module (chaîne de ../../../)
import { ERROR_CODES } from '../../../../../constants/error-codes.constant';
```

### Règle 3 : importer le `<module>.service.ts` via le barrel quand il existe

Si un module a un `index.ts` qui réexporte son service principal, importer via le barrel :

```ts
// ✅
import { PaymentService } from '@/modules/shared/finance/payment';

// ❌ — bypass le contrat d'export du module
import { PaymentService } from '@/modules/shared/finance/payment/services/payment.service';
```

### Règle 4 : `type` imports pour les types-only

```ts
// ✅
import type { Account } from '../models/account.model';

// ❌ — import value sur un type-only (alourdit le bundle, casse les barrels safe)
import { Account } from '../models/account.model';
```

Le linter corrige souvent automatiquement. Mais l'écrire correctement du premier coup évite un fix bruyant.

### Règle 5 : repos = SEUL endroit qui importe les modèles/entités de l'ORM

Un service ne fait **jamais** `import { campaign } from '...'` + `db.update(campaign)...`. Il appelle `campaignRepo.reserveBudget(...)`. Toute manipulation de l'ORM (query builder, `db.select/insert/update/delete`, repository TypeORM, client Prisma) vit dans un `*.repo.ts`.

### Règle 6 : DTOs importables depuis le module qui les expose

Les DTOs vivent dans `validators/<module>.dto.ts`. Quand un autre module a besoin d'un type pour le typer (par exemple un service qui retourne un `AccountResponseDto`), importer le DTO directement — c'est OK, les DTOs sont des contrats type-only la majorité du temps.

```ts
// ✅
import type { AccountResponseDto } from '@/modules/payment/account/validators/account.dto';
```

</imports_discipline>

<process>

## Procédure quand on me demande "crée un module / ajoute un controller / ajoute X"

### Étape 1 — Vérifier le besoin et la frontière

1. **Le code à ajouter rentre-t-il dans un module existant ?** Si oui, dans lequel ? Si non, nouveau module — choisir `<domaine>` et `<module>`.
2. **Y a-t-il une exposition HTTP ?** Si oui → controller + docs + DTOs. Si non → pas de controller, pas de DTOs Request (juste types internes).
3. **Y a-t-il une table DB nouvelle ?** Si oui → model + repo + fixture (+ relations si l'ORM le requiert, voir [circular_dependencies]).
4. **Y a-t-il une planification ?** Si oui → cron. Une queue ? → jobs. Un sink d'observabilité ? → monitor.

### Étape 2 — Scaffold du squelette

Créer les fichiers dans cet ordre :

1. `<module>.module.ts` — vide au début, on remplit au fur et à mesure.
2. `models/<entity>.model.ts` (+ `.relations.ts` si l'ORM le requiert, ex: Drizzle).
3. `models/index.ts` (re-export).
4. **Générer la migration via l'outil de l'ORM** (`drizzle-kit generate`, `typeorm migration:generate`, `prisma migrate dev`, etc. — vérifie la commande exacte dans la doc / les scripts du projet). **Jamais de SQL écrit à la main** si l'outil sait le générer.
5. `validators/<module>.dto.ts` (si controller).
6. `repos/<entity>.repo.ts`.
7. `services/<module>.service.ts`.
8. Si helpers déjà identifiés → `services/helpers/<thing>.helper.ts` ou `.service.ts`.
9. `controllers/<module>.controller.ts` + `docs/endpoints/<verb>-<thing>.doc.ts` + `docs/commons/...` (si controller).
10. `crons/<verb>.cron.ts` (si cron) ou `jobs/...` (si queue).
11. `specs/<entity>.fixture.ts` puis spec d'intégration → déléguer au skill de tests d'intégration.

### Étape 3 — Remplir `<module>.module.ts`

Lister les providers par rôle. Exporter UNIQUEMENT ce qui sera consommé par un autre module (généralement le service principal + parfois le repo principal).

```ts
@Module({
  imports: [], // ← modules tiers + config dynamique (queue, jwt…)
  controllers: [], // ← un seul, et seulement si HTTP
  providers: [
    // repos / services / monitors / crons / processors
  ],
  exports: [], // ← surface publique minimale
})
export class XxxModule {}
```

> Si le projet utilise un décorateur de module custom (slots `repos`/`services`/`crons`/`processors`, split API/worker), l'utiliser à la place de `@Module`.

### Étape 4 — Auditer le résultat

Avant de déclarer "fait", relire en croisant avec ce skill :

- [ ] Un seul fichier par responsabilité, nommé correctement (pas de `<module>-<feature>.service.ts`).
- [ ] Modèles organisés selon la recommandation de l'ORM (ex: `.model.ts` + `.relations.ts` pour Drizzle).
- [ ] Repos n'importent que des modèles/entités.
- [ ] Services n'importent jamais un repo d'un autre module et ne touchent jamais l'ORM directement.
- [ ] Aucun `forwardRef`, ou s'il y en a un, un commentaire justifie + TODO.
- [ ] `docs/` complet si controller : un fichier `.doc.ts` par endpoint, un fichier d'erreur par code remontable.
- [ ] `exports` ne contient QUE ce qui est consommé ailleurs.
- [ ] `index.ts` de barrel sans side effect (rien qui s'évalue).
- [ ] Si jobs : le `jobs/index.ts` n'exporte pas le processor.
- [ ] La suite de validation passe (voir Étape 5).

### Étape 5 — Faire passer la suite de validation

Lance la suite de validation du projet via son gestionnaire de paquets (npm / pnpm / yarn / bun), généralement dans cet ordre :

```bash
<pm> run typecheck      # zéro erreur TypeScript
<pm> run lint           # ou check:fix / format
<pm> run test
<pm> run build
```

Si une étape échoue avec une erreur **causée par notre code** → corriger immédiatement.
Si une étape échoue avec une erreur **pré-existante** → la remonter explicitement (fichier:ligne + message + preuve qu'elle existait avant), ne pas la corriger en douce dans le commit en cours.

</process>

<antipatterns>

## Antipatterns à fuir

### Le service hybride controller+service

```ts
// ❌ INTERDIT — un service qui retourne un DTO HTTP
@Injectable()
export class XxxService {
  async create(dto: CreateDto): Promise<XxxResponseDto> {
    // mapping DTO ↔ entity dans le service
  }
}
```

→ Le service retourne une entité (`Xxx`), le controller mappe en `XxxResponseDto` si besoin. Si le mapping est trivial (`...spread`), le controller peut juste retourner l'entité (les DTOs servent à valider l'**input** et documenter la **shape** de sortie, pas à transformer).

### Le repo qui orchestre

```ts
// ❌ INTERDIT — un repo qui appelle un autre repo ou un service
@Injectable()
export class CommissionRepo {
  constructor(
    private readonly db: Database,
    private readonly accountRepo: AccountRepo, // ❌
    private readonly userService: UserService, // ❌
  ) {}
}
```

→ Un repo accède à UNE table (et joint les tables liées pour ses queries). Il ne dépend pas d'autres repos ni de services. L'orchestration vit dans le service.

### Le helper qui devient un service ad-hoc

```ts
// ❌ INTERDIT — fonctions exportées librement à la racine du module
// <racine>/modules/payment/account/utils.ts
export function generateCode(name: string) { ... }
export function validateConsent(userId: string) { ... }
```

→ Les fonctions pures vont dans `services/helpers/<thing>.helper.ts`. Les helpers @Injectable vont dans `services/helpers/<thing>.service.ts`. Pas de `utils.ts`, pas de `lib.ts`, pas de `common.ts` à la racine.

### Le module fourre-tout

```
<racine>/modules/payment/
└── payment.module.ts   ← controller pour 3 ressources, 4 services, 5 repos
```

→ Si `payment.module.ts` mélange account / referral / commission / stats, splitter en sous-modules. Layout correct :

```
<racine>/modules/payment/
├── payment.module.ts        ← @Module orchestrateur qui importe les sous-modules
├── account/
├── referral/
├── commission/
└── stats/
```

Chaque sous-module a sa frontière nette.

### Le doc Swagger inline dans le controller

```ts
// ❌ INTERDIT
@Get(':id')
@ApiResponse({ status: 200, description: 'OK', type: AccountResponseDto })
@ApiResponse({ status: 404, description: 'Not found' })
async get(@Param('id') id: string) { ... }
```

→ Décorateur composite dans `docs/endpoints/get-account.doc.ts`, applique-le via `@GetAccountDoc()`. Le controller reste lisible (1 ligne par endpoint en plus de la signature).

### Le `forwardRef` non documenté

```ts
// ❌ INTERDIT
@Module({
  imports: [forwardRef(() => OtherModule)],
})
```

→ Tout `forwardRef` doit avoir un commentaire qui dit pourquoi et un TODO pour l'éliminer. La solution propre est presque toujours d'extraire un troisième module.

### Le barrel qui exporte trop

```ts
// ❌ INTERDIT
export * from './services';
export * from './repos';
export * from './controllers';
export * from './validators';
export * from './models';
```

→ Le `index.ts` racine d'un module n'exporte **que** ce qui est sa surface publique externe (généralement `<module>.service.ts` et parfois `<module>.module.ts`). Les autres fichiers sont consommés **dans** le module via des imports relatifs ou par DI Nest.

### Le processor importé côté producer

```ts
// ❌ INTERDIT côté OrderModule (producer)
import { CreateNotificationProcessor } from '../notification/jobs';
```

→ Importer la queue module et les types, jamais le processor. Le `jobs/index.ts` doit **ne pas** réexporter le processor pour rendre cette erreur impossible.

### Le service qui parle directement à l'ORM

```ts
// ❌ INTERDIT dans un service
import { campaign } from '@/modules/.../models/campaign.model';
await this.db.update(campaign).set({ ... }).where(...);
```

→ Toute requête vit dans un `*.repo.ts`. Si le repo n'expose pas la méthode voulue, l'ajouter au repo — ne pas contourner.

</antipatterns>

<reference_archetypes>

## Archétypes de référence

Trois formes de modules qui couvrent la majorité des cas. Quand tu scaffoldes, identifie l'archétype le plus proche et calque-toi dessus. Remplace les noms par ceux du projet.

### Archétype 1 — module HTTP avec helpers

Module qui expose des routes et délègue à des helpers spécialisés.

- Service principal `<module>.service.ts` qui orchestre.
- Helpers `services/helpers/*.service.ts` (avec DI) et `*.helper.ts` (purs).
- Modèles organisés selon l'ORM (split `.model.ts` + `.relations.ts` pour Drizzle).
- Docs complète : `docs/endpoints/` + `docs/commons/` (responses, errors, params).
- Spec d'intégration via `Test.createTestingModule({ imports: [TheModule] })`.

### Archétype 2 — module avec cron + queue

Module qui planifie des tâches et/ou produit/consomme une queue.

- `crons/<verb>.cron.ts` (un cron par fichier, logique déléguée au service).
- `jobs/<queue>-queue.module.ts` centralisé, importé par producer et consumer.
- `jobs/index.ts` producer-safe (n'exporte pas le processor).
- `jobs/<verb>-<thing>.processor.ts` importé uniquement via les providers (ou le slot `processors`) du `<module>.module.ts`.

### Archétype 3 — module fournisseur partagé

Module qui expose des services à un grand nombre de consumers (finance, auth, notifications…).

- Surface publique minimale : le service orchestrateur re-exporté via le barrel.
- Sous-modules par sous-domaine, chacun avec son repo + service (+ monitor).
- DTOs au niveau du module parent pour les contrats partagés, puis dans chaque sous-module pour les types détaillés.

</reference_archetypes>

<output_format>

Quand l'utilisateur demande "crée un module / ajoute un controller / ajoute X" :

1. **Identifier la frontière** : nouveau module ou ajout à un module existant ? Justifier en 1 phrase.
2. **Lister les fichiers à créer** dans l'ordre du [process] étape 2, avec les chemins exacts.
3. **Si la demande implique une migration DB** : rappeler de générer la migration via l'outil de l'ORM (jamais de SQL manuel).
4. **Si le code touche une logique métier non triviale** : déléguer la suite au skill de tests d'intégration pour la couverture.
5. **Auditer** avec la checklist [process] étape 4 avant de déclarer "fait".
6. **Rapporter** : fichiers créés/modifiés, modules importés/exportés, dépendances externes (queue / SDK tiers) et choix d'implémentation faits (split helper vs. service principal, par exemple).

</output_format>
