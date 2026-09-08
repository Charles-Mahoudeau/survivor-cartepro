# RULE : Une pull request s'écrit en ANGLAIS — titre, description, commentaires. Le français reste la langue de la conversation et de la doc projet, jamais celle d'un artefact de dépôt

## Contexte

PR #65 (retrait de l'identité de l'État, passage du produit à CartePro). Je l'ai
ouverte avec un titre et une description **en français** :

> `feat(frontend): retirer l'identité de l'État et passer le produit à la charte CartePro`
>
> ## Pourquoi
>
> Deux courriers du cabinet, reçus aujourd'hui, portent sur ce que l'application
> montre à l'écran…

Le dépôt, lui, est intégralement en anglais : les messages de commit
(`feat(frontend): replace the state design system with the product identity`), les
commentaires de code, les noms de tests, la doc Swagger. La description de la PR
était donc le seul artefact du dépôt à parler une autre langue que ses propres
commits. Nolan a corrigé : « met la pr en anglais ».

## Erreur commise

Avoir rédigé un artefact **de dépôt** dans la langue de la **conversation**. La PR
n'est pas une réponse adressée à Nolan : c'est un document versionné, lu par
l'équipe, cité dans une revue, archivé à côté de commits anglais qu'elle est censée
résumer.

Aggravant : dans la même session, j'avais écrit les cinq messages de commit en
anglais — donc j'avais la bonne convention en tête, et je l'ai abandonnée au moment
de passer à un livrable plus long. C'est la longueur du texte qui a fait basculer
vers la langue dans laquelle je réfléchissais avec l'utilisateur.

## Cause racine

Confusion entre **destinataire** et **support**. Nolan écrit en français, je lui
réponds en français, et une PR « s'adresse » à lui — donc j'ai suivi le
destinataire. Mais la langue d'un artefact se décide par le **support** : ce qui
vit dans le dépôt parle la langue du dépôt, quelle que soit la langue dans laquelle
il a été demandé.

## Règle à appliquer

1. **Toute pull request s'écrit en anglais** : le titre, la description entière,
   les en-têtes de sections, les tableaux, les listes, et **tout commentaire que je
   poste sur la PR** (revue, réponse à une revue, message de suivi). Aucun mélange
   de langues dans un même document.
2. **Le titre suit Conventional Commits, comme les commits** (cf. `commit.md`) :
   même type, même scope, même style de description — en anglais.
3. **Le français reste la langue** de la conversation avec Nolan, des
   `.claude/rules/`, de `.planning/`, des runbooks, du README et de la doc projet.
   Cette règle ne les touche pas : elle porte sur les PR.
4. **Une citation d'une source française ne se traduit pas en silence.** Un courrier
   du cabinet, une exigence du cahier des charges, un libellé d'interface : soit on
   cite verbatim en français entre guillemets, soit on traduit **en le disant**.
   ⚠️ Une **mention à la lettre imposée par le client** (ici « Démonstrateur
   technique, ne constitue pas un service public en exploitation. ») ne se traduit
   **jamais** : la traduire dans une PR laisse croire que le code porte la version
   traduite.
5. **Les noms propres et les identifiants ne se traduisent pas** : noms de
   personnes, de ministères, de fichiers, de branches, de variables, références de
   cahier des charges (`JEB/DNI/2026-002`).
6. **Corollaire de relecture** : avant d'ouvrir ou d'éditer une PR, relire le titre
   et la première section. S'ils sont en français alors que les commits qu'ils
   résument sont en anglais, la PR n'est pas prête.

## Exemple

- ❌ **Avant (incorrect)** :
  ```
  feat(frontend): retirer l'identité de l'État et passer le produit à la charte CartePro

  ## Pourquoi
  Deux courriers du cabinet, reçus aujourd'hui, portent sur ce que l'application
  montre à l'écran…
  ```
- ✅ **Après (correct)** :
  ```
  feat(frontend): drop the state design system and rename the product to CartePro

  ## Why
  Two letters from the cabinet, both received on 7 September, bear on what the
  application puts on screen…
  ```
