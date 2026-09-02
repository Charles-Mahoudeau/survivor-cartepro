---
name: write-unit-tests
description: 'Écrire un test unitaire dans ce projet. Déclenché quand l''utilisateur demande un "test unitaire", "unit test", "spec", ou quand tu vas créer un *.spec.ts qui ne touche ni la DB, ni Redis, ni HTTP, ni Stripe, ni Discord, ni le filesystem, ni l''horloge. Pose le contrat strict : zéro mock, zéro dépendance externe, test de la pure logique métier, couverture multi-contexte pour la non-régression.'
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

<objective>
Garantir que chaque test unitaire écrit dans ce projet teste uniquement la **logique interne d'une fonction ou d'une classe**, sans aucun mock ni dépendance externe, avec une couverture multi-contextes suffisante pour empêcher toute régression sur du code qui est utilisé à plusieurs endroits.

Si le code à tester a besoin d'une dépendance externe, **ce n'est pas un test unitaire** — c'est un test d'intégration. Ce skill ne s'applique pas, il faut rediriger vers le pattern intégration (`*.integration.spec.ts` + fixtures).
</objective>

<scope>

## Définition d'un test unitaire dans ce projet

Un test unitaire prouve que la **logique métier interne** d'une unité de code (fonction, classe pure, transformer, parser, formateur, builder, helper, pipe stateless) se comporte conformément à sa spécification, **pour TOUS les contextes prévus, pas seulement le cas d'usage immédiat**.

Un test unitaire :

1. **Instancie directement** la fonction ou la classe à tester.
2. **N'accède à AUCUNE ressource externe** : pas de DB, pas de Redis, pas de Bull queue, pas d'API HTTP, pas de Stripe SDK, pas de Discord SDK, pas de filesystem, pas d'horloge système (`new Date()` figé acceptable uniquement si la fonction le prend en paramètre).
3. **N'utilise AUCUN mock, stub, spy, fake, in-memory replacement** — ni `jest.fn()`, ni `mock.module(...)`, ni `as any`-stub, ni `vi.spyOn`.
4. **Construit ses propres inputs synthétiques** : tableaux, objets imbriqués, valeurs limites — pas les DTOs ou modèles du domaine métier, sauf si on teste justement leur logique de validation.
5. **Couvre la logique, pas un cas d'usage** : si la fonction est utilisée à 30 endroits différents, le test doit couvrir les patterns d'entrée qu'on rencontre vraiment à ces 30 endroits, pas seulement le premier.

## Quand c'est un test d'intégration et pas un test unitaire

Si **une seule** de ces conditions est vraie, c'est un test d'intégration, pas unitaire :

- Le code possède une dépendance à un repository, un service, un SDK externe, un module Nest, ou tout autre code qui n'est pas une fonction pure ou une classe sans dépendance.
- Le code lit / écrit en DB (même via Drizzle in-memory simulé).
- Le code attend une réponse de Discord, Stripe, ou un autre SDK externe.
- Le code utilise BullMQ, Redis, ou un timer réel.
- Le test instancie un Nest module avec `Test.createTestingModule(...)` complet.

Dans ces cas : suivre le pattern `*.integration.spec.ts` avec les fixtures du projet (`*.fixture.ts`), helper `wireServices(db, discordMock, schedulerMock)` quand il existe. Voir `broadcast-lifecycle.integration.spec.ts` comme référence.

**Ne JAMAIS écrire un test "unitaire" qui mocke 5 dépendances pour faire semblant d'isoler.** C'est l'antipattern que l'utilisateur a explicitement rejeté.

</scope>

<rules>

## Règles absolues

### 1. Zéro mock, zéro stub, zéro fake

Aucun de ces patterns n'a sa place dans un fichier unitaire de ce projet :

```ts
// ❌ INTERDIT
const repoStub = { findById: jest.fn(async () => fakeData) };
const service = new Service(repoStub as any);

// ❌ INTERDIT
mock.module('@/some/external', () => ({ ... }));

// ❌ INTERDIT
const spy = vi.spyOn(obj, 'method').mockReturnValue(...);
```

Si tu te dis "je vais juste stubber X pour ce test", c'est le signal que :

- soit tu testes du code qui n'est pas testable unitairement (refactorise-le ou écris une intégration),
- soit tu testes le mauvais niveau (le code à tester est ailleurs).

### 2. Une unité = un fichier de spec, pas un cas d'usage

Le nom du spec correspond à l'unité testée, pas au cas d'usage qui a motivé le test.

- ✅ `validation.pipe.spec.ts` (teste le pipe en général)
- ❌ `validation.pipe.ad.spec.ts` ou `ad-validation.pipe.spec.ts` (l'Ad est un cas d'usage, pas l'unité testée)

### 3. Test de la logique interne, pas du cas d'usage

C'est la règle la plus violée. Quand tu testes une fonction utilisée à plusieurs endroits, **le test doit couvrir les patterns que la fonction doit savoir gérer**, pas seulement le scénario qui t'a amené là.

Exemple : `validationPipe` est utilisé partout dans l'app (toutes les DTOs, tous les endpoints, query params, body params, params d'URL). Le tester uniquement avec `CreateAdDto` ne prouve pas qu'il ne régresse pas sur :

- les UUIDs en params (`@IsUUID()`)
- les query params transformés (`@Type(() => Number)`)
- les enums (`@IsEnum()`)
- les tableaux de primitives (`@IsArray() @IsString({ each: true })`)
- les tableaux d'objets imbriqués multi-niveaux
- les DTOs sans aucune contrainte (transformation seulement)
- les DTOs avec `forbidNonWhitelisted` (propriétés inconnues)
- les booléens / numbers avec coercion implicite
- une validation qui réussit (chemin nominal)

→ Pour ce genre d'unité partagée, **crée des DTOs synthétiques dans le fichier de spec** dédiés à exercer chaque branche du code testé.

### 4. Helpers : `xxx.helper.ts` ou `helpers/` à côté du spec

Les fonctions utilitaires partagées entre tests vont :

- soit dans un fichier voisin nommé `<nom-de-l-unité>.helper.ts` (si peu d'helpers)
- soit dans un sous-dossier `helpers/` à côté du spec (si plusieurs helpers)

Pas de helper inline copié-collé entre fichiers, pas de helper dans `src/` qui ne sert qu'aux tests.

```
src/commons/pipes/
├── validation.pipe.ts
└── specs/
    ├── validation.pipe.spec.ts
    └── helpers/
        ├── synthetic-dtos.helper.ts
        └── expect-validation-error.helper.ts
```

### 5. Multi-contexte = non-régression

Pour chaque branche conditionnelle (`if`, `switch`, `?:`, `??`, `try/catch`), il faut au moins **un test qui prouve qu'elle est prise** et **un test qui prouve qu'elle ne l'est pas quand elle ne doit pas l'être**.

Pour chaque structure d'entrée que la fonction doit savoir traiter, il faut un test :

- objet plat
- objet imbriqué 1 niveau, 2+ niveaux
- tableau de primitives
- tableau d'objets
- tableau d'objets imbriqués
- valeurs limites (null, undefined, empty string, 0, -0, NaN, Infinity, tableau vide)
- inputs malformés (mauvais type, mauvais format)
- input valide (chemin nominal) — toujours

</rules>

<process>

## Procédure quand on te demande "écris un test unitaire pour X"

### Étape 1 — Qualifier l'unité

1. **Lis le code de X.** Si X dépend d'un Repo, d'un SDK externe, d'un `db`, **arrête-toi** et propose à l'utilisateur :
   - soit refactoriser X pour extraire la logique pure dans une fonction sans dépendance ;
   - soit écrire un test d'intégration.

2. **Identifie les responsabilités de X** : "X prend un Y, fait Z, retourne W." Une responsabilité = un groupe de tests.

3. **Identifie les utilisations de X** dans le code (`grep -r "import X"` ou cherche les usages). Si X est utilisé à plusieurs endroits, liste les **patterns d'entrée distincts** que X reçoit dans ces usages. Ces patterns deviennent les contextes de test.

### Étape 2 — Construire les inputs synthétiques

**Ne réutilise pas les DTOs/types du domaine métier** sauf si c'est précisément ce que tu testes. Construis des fixtures de test minimales qui exercent une seule chose à la fois.

Exemple pour `validationPipe` :

```ts
// helpers/synthetic-dtos.helper.ts
import {
  IsArray,
  IsEnum,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FlatDto {
  @IsString() name: string;
  @IsUUID() id: string;
}

export class WithArrayDto {
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}

export class NestedDto {
  @ValidateNested()
  @Type(() => FlatDto)
  inner: FlatDto;
}

export enum SyntheticEnum {
  A = 'A',
  B = 'B',
}
export class WithEnumDto {
  @IsEnum(SyntheticEnum) value: SyntheticEnum;
}

// etc.
```

### Étape 3 — Couvrir chaque pattern

Pour `validationPipe`, le spec doit prouver :

- **Pas d'erreur** quand l'input est valide (FlatDto, NestedDto, WithArrayDto, WithEnumDto…)
- **Aplatissement des erreurs imbriquées** : `NestedDto.inner.name` → path `inner.name`
- **Indexation des tableaux** : `WithArrayDto.tags[0]` → path `tags[0]`
- **Tableaux d'objets imbriqués** : `[{ inner: { name } }]` → `[0].inner.name`
- **Coercion implicite** : `@Type(() => Number)` sur un string `"42"` → conversion ok
- **`forbidNonWhitelisted: true`** : propriété inconnue → erreur
- **Message custom** : `{ message: 'CODE' }` → `code: 'CODE'`
- **Context custom** : `{ context: { max: 256 } }` → `params: { max: 256 }`
- **Message par défaut class-validator** : pas de `{ message }` → `code` est le message brut
- **Mode prod** vs **mode dev** : différence sur le payload
- **Plusieurs erreurs simultanées** : 1 erreur par champ qui échoue, pas concaténées

### Étape 4 — Bun test, structure

- Utiliser `bun:test` (le projet est en Bun).
- Chaque scénario dans un `it(...)` indépendant.
- Pas de banderoles ASCII (rule projet : `fix-format-no-decorative-comments.md`).
- Pas de fixture DB, pas de `globalThis.testDb`.

### Étape 5 — Checklist avant de déclarer "fait"

- [ ] Zéro import depuis `*.fixture.ts`
- [ ] Zéro `globalThis.testDb` / `cleanupDatabase` / `resetDatabase`
- [ ] Zéro `mock.module`, `jest.fn`, `vi.spyOn`, stub object
- [ ] Zéro `as any` qui sert à contourner une dépendance
- [ ] Les helpers sont dans `helpers/` ou `xxx.helper.ts` voisin
- [ ] Au moins un test par branche conditionnelle du code testé
- [ ] Inputs synthétiques (sauf si on teste un DTO/type spécifique du domaine)
- [ ] Les patterns d'usage réels du code dans la codebase sont tous couverts
- [ ] Le spec passe : `bun test <path-to-spec> --timeout 30000`
- [ ] `bun run typecheck` passe
- [ ] `bun run check:fix` ne fait aucun fix sur le nouveau fichier

</process>

<antipatterns>

## Antipatterns à fuir

### Le test "qui prouve juste mon cas d'usage"

```ts
// ❌ Tester un pipe partagé uniquement avec le DTO du jour
import { CreateAdDto } from '@/modules/.../create-ad.dto';
describe('AppValidationPipe', () => {
  it('valide un CreateAd', async () => { ... });
  it('rejette un CreateAd invalide', async () => { ... });
});
```

→ Cette suite a **deux faiblesses critiques** :

1. Elle laisse passer toute régression qui n'affecte que d'autres DTOs (UUIDs, tableaux, enums).
2. Elle couple le test au domaine Ad. Si l'Ad évolue, le test casse pour la mauvaise raison.

### Le test "qui isole avec des stubs"

```ts
// ❌ Faux test unitaire — mock des dépendances pour faire semblant
const repoStub = { findById: jest.fn().mockResolvedValue(fakeAd) };
const service = new AdService(repoStub as any, ...);
```

→ Ne prouve rien sur le vrai comportement. Préférer un **vrai test d'intégration** ou refactoriser pour extraire la logique pure dans une fonction sans dépendance.

### Le test qui retombe sur des constantes du domaine

```ts
// ❌ Tester un parser générique avec uniquement les valeurs métier connues
it('parse les niveaux', () => {
  expect(parse('INFO')).toBe('info');
  expect(parse('ERROR')).toBe('error');
});
```

→ Manque `null`, `undefined`, `''`, casing inattendu, valeurs hors enum, etc.

### Le helper recopié dans chaque spec

```ts
// ❌ Dupliqué dans 5 specs
function buildValidInput() { return { ... }; }
```

→ Si utilisé 2+ fois, déplacer dans `helpers/`.

</antipatterns>

<examples>

## Bon exemple : test du pipe de validation

Le `AppValidationPipe` est utilisé pour TOUTE l'app. Le bon test ne teste **pas** un DTO métier précis — il teste la logique du pipe avec des DTOs synthétiques qui exercent chaque branche.

```ts
// src/commons/pipes/specs/validation.pipe.spec.ts
import 'reflect-metadata';
import { beforeEach, describe, expect, it } from 'bun:test';
import { HttpException } from '@nestjs/common';
import { AppValidationPipe } from '@/commons/pipes/validation.pipe';
import type { LoggerConfig } from '@/config';
import {
  FlatDto, NestedDto, WithArrayOfPrimitivesDto, WithArrayOfObjectsDto,
  WithEnumDto, WithCustomMessageDto, WithContextDto, WithNumberCoercionDto,
} from './helpers/synthetic-dtos.helper';
import { expectValidationError } from './helpers/expect-validation-error.helper';

const devConfig: LoggerConfig = { nodeEnv: 'development', isProduction: false, level: 'info', inspect: false };
const prodConfig: LoggerConfig = { nodeEnv: 'production', isProduction: true, level: 'info', inspect: false };

describe('AppValidationPipe', () => {
  describe('flat object', () => {
    it('accepte un input valide', async () => { ... });
    it('renvoie { field, code } sur un champ invalide', async () => { ... });
    it('renvoie une entrée par champ qui échoue', async () => { ... });
  });

  describe('nested object', () => {
    it('aplatit `inner.name` dans field path', async () => { ... });
    it('aplatit 3 niveaux : `a.b.c.name`', async () => { ... });
  });

  describe('arrays', () => {
    it('indexe les tableaux de primitives : `tags[0]`', async () => { ... });
    it('indexe les tableaux d objets : `items[2].name`', async () => { ... });
    it('combine indexation et imbrication : `items[0].inner.name`', async () => { ... });
  });

  describe('coercion class-transformer', () => {
    it('convertit "42" en number sur @Type(() => Number)', async () => { ... });
    it('laisse un objet au top-level avec coercion désactivée', async () => { ... });
  });

  describe('forbidNonWhitelisted', () => {
    it('rejette une propriété inconnue', async () => { ... });
  });

  describe('message et context custom', () => {
    it('utilise { message: "X" } comme code', async () => { ... });
    it('expose { context: { max: 256 } } dans params', async () => { ... });
    it('fallback sur le message class-validator si pas de message custom', async () => { ... });
  });

  describe('payload prod vs dev', () => {
    it('omet `value` en prod', async () => { ... });
    it('inclut `value` en dev', async () => { ... });
  });

  describe('shape HttpException', () => {
    it('renvoie statusCode 400, message VALIDATION_FAILED, errors[]', async () => { ... });
  });
});
```

Les `helpers/synthetic-dtos.helper.ts` et `helpers/expect-validation-error.helper.ts` portent toute la mécanique de réutilisation.

## Bon exemple : test d'un parser

```ts
// src/helpers/orm/specs/filter.parser.spec.ts
describe('parseFilter', () => {
  describe('cas valides', () => {
    it('parse un filtre simple', () => { ... });
    it('parse plusieurs filtres', () => { ... });
    it('parse les types : number, boolean, string, null', () => { ... });
  });

  describe('cas limites', () => {
    it('retourne [] pour une chaîne vide', () => { ... });
    it('throw sur opérateur inconnu', () => { ... });
    it('throw sur séparateur manquant', () => { ... });
  });
});
```

Aucun mock, aucune dépendance, juste la fonction et des inputs synthétiques.

</examples>

<output_format>

Quand l'utilisateur demande "écris un test unitaire pour X" :

1. **Confirme l'unité testable**. Si X a une dépendance externe, propose une alternative (refactoriser ou intégration) et **arrête-toi**.
2. **Liste les contextes à couvrir** dans un court bullet point (≤ 10 lignes), grouppés par responsabilité.
3. **Crée les helpers** dans `<spec-folder>/helpers/` si plus d'un helper est nécessaire, sinon dans un fichier `xxx.helper.ts` voisin.
4. **Écris le spec** en suivant la checklist `<process>`.
5. **Lance le spec** : `bun test <path> --timeout 30000`.
6. **Vérifie la suite globale** : `bun run typecheck && bun run check:fix && bun run test`.
7. **Rapporte** : nombre de tests, contextes couverts, helpers créés.

</output_format>
