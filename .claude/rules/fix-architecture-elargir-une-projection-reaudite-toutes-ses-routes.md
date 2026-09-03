# RULE : Élargir une projection élargit TOUTES les routes qui la servent — ré-auditer la garde de chacune, en priorité celles dont on savait déjà qu'elles n'en avaient pas

## Contexte

PR « identité des organisateurs » (2026-08-27). Elle élargit `CoOrganizerResponseDto` →
`OrganizerResponseDto` : trois champs deviennent six (ajout de `firstName`, `isFollowing`,
`followsViewer`).

**Deux jours plus tôt, dans la même conversation, j'avais moi-même trouvé et signalé que
`GET /party/:id/co-organizers` n'a aucune garde par ressource** — pas de `@CurrentUser`, pas
de contrôle de visibilité, n'importe quel compte authentifié obtenant l'identité des
co-organisateurs de n'importe quel id de soirée, brouillon ou bannie incluse. Je l'avais
classé « hors sujet du plan, mérite une issue » et j'étais passé à autre chose.

La PR a alors ajouté un `@CurrentUser` à cette route — pour résoudre les arêtes de follow —
**sans jamais ajouter la garde**. Résultat : une route déjà fuyante s'est mise à servir
davantage (prénom + arêtes), et à un viewer désormais identifié. La revue l'a classée
`Critical` et bloqué le merge.

## Erreur commise

Avoir traité « cette route n'a pas de garde » comme une **dette à ticketer** au lieu d'une
**contrainte sur le travail en cours**, alors que le travail en cours consistait précisément
à enrichir ce que cette route renvoie. Les deux informations étaient dans ma tête à quelques
heures d'intervalle et je ne les ai pas reliées.

Aggravant : mon propre brief d'exécution listait cette route comme « 11ᵉ surface, le
compilateur la fera remonter tout seul » — j'ai donc pensé au **type**, pas à l'**accès**.
Le compilateur signale un DTO qui change de forme ; il ne signale jamais une garde absente.

## Cause racine

Une projection n'appartient pas à la route qui a motivé son élargissement : elle appartient
à **toutes** les routes qui la servent. Le rayon d'un changement de DTO est le rayon du DTO,
pas celui de la user story. Et une garde manquante est invisible dans un diff — elle n'est
nulle part, donc elle n'apparaît sur aucune ligne modifiée.

Second facteur : le mot « ticketer » désamorce. Une fois qu'un défaut a une issue promise,
il cesse d'être un obstacle dans la tête ; il devient un objet déjà rangé. C'est
exactement quand il faut le ressortir.

## Règle à appliquer

1. **Avant d'élargir un DTO partagé, lister TOUTES les routes qui le servent, et pour
   chacune vérifier la garde d'accès dans le service** — pas la doc, pas le nom de la
   méthode, pas la route voisine. Le grep de départ est le nom de la classe, pas le nom de
   la feature.
2. **Un défaut d'accès signalé dans une conversation reste une contrainte tant qu'il n'est
   pas corrigé.** S'il touche une surface que la PR en cours modifie — même de loin, même
   « seulement le DTO » — il entre dans la PR ou il bloque le merge. Ne jamais dire « hors
   périmètre » d'un trou d'accès sur une route que la PR rend plus bavarde.
3. **Ne jamais compter sur le compilateur pour une question d'accès.** Il attrape les formes,
   jamais les droits. Une surface « que le compilateur fera remonter » est signalée sur son
   type et **silencieuse sur sa garde** : c'est le pire des deux mondes, parce qu'elle a
   l'air traitée.
4. **Une facette d'une ressource répond exactement aux viewers auxquels la ressource
   répond** — jamais plus. Si `GET /x/:id` applique trois assertions, `GET /x/:id/facette`
   applique les mêmes. Le moyen de le garantir est **une garde partagée et appelée**, pas
   trois assertions recopiées : ici, une méthode publique `assertReadableByViewer` que les
   deux chemins traversent.
5. **Quand la garde partagée créerait un cycle de modules**, ce n'est pas une raison de s'en
   passer : c'est le signal de déplacer le point d'entrée (ici, le contrôleur appelle le
   service qui possède déjà la garde, plutôt que le service qui possède seulement la
   donnée).
6. **Le test de fermeture d'un trou d'accès a besoin de son contrôle.** Asserter qu'un
   étranger reçoit un 404 ne prouve rien seul — la garde pourrait jeter sur tout le monde.
   Il faut, dans le même fichier, un manager qui lit sa ressource non publiée et un étranger
   qui lit une ressource publiée. Trois tests, ou aucun.

## Exemple

- ❌ **Avant (incorrect)** : « `GET /party/:id/co-organizers` n'a aucune garde — hors sujet
  du plan, ça mérite une issue. » Puis, dans la PR qui suit : ajout d'un
  `@CurrentUser` à cette route pour résoudre les arêtes de follow, et d'un `firstName` au
  DTO qu'elle renvoie. Le trou est resté ouvert et s'est élargi.
- ✅ **Après (correct)** : le grep part de `CoOrganizerResponseDto`, trouve les routes qui la
  servent, et constate que l'une d'elles n'a pas de garde → elle entre dans le périmètre.
  `PartyService.assertReadableByViewer` devient publique, `findByIdForViewer` et
  `listCoOrganizersForViewer` la traversent toutes les deux, et trois tests prouvent que la
  garde discrimine au lieu de tout refuser.
