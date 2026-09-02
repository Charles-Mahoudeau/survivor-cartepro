# RULE : Poser le CONTEXTE avant le livrable — jamais un résumé qui suppose acquis ce dont on n'a jamais parlé dans CETTE conversation

## Contexte

Premier message d'une conversation : un rapport du front disant que `PartyResponseDto`
ne porte pas l'identité du créateur d'une soirée. J'ai répondu par un plan en six
sections, dense en `fichier:ligne`, en noms de classes et en verdicts (« je change ça de
la reco du front », « N+1 pré-existant »), sans jamais dire en amont : de quel écran on
parle, ce que l'utilisateur voit aujourd'hui à l'écran, ce que le backend envoie
aujourd'hui, et ce que ça casse pour l'utilisateur final.

Réaction : « tu me fais un putain de résumé où je comprends rien parce que tu mets aucun
contexte ». C'est la deuxième fois dans la même conversation qu'un livrable part trop
loin dans le raisonnement.

## Erreur commise

Avoir rédigé pour un lecteur qui aurait ma pile d'appels d'outils en tête. Les quinze
fichiers que je venais de lire me donnaient le contexte ; le lecteur n'en avait lu aucun.
Chaque `party.repo.ts:14` était une **conclusion livrée sans sa prémisse**.

## Cause racine

Confusion entre **ce que j'ai établi** et **ce que le lecteur sait**. Un plan est
structuré par la solution ; il doit être **introduit par le problème**. Et le contexte
d'un sujet ne se transmet pas par une référence de fichier : il se dit en une phrase de
français.

Facteur aggravant : la densité technique **imite** la rigueur. Plus le livrable est
précis, plus il paraît fondé — et moins il est lisible pour qui n'a pas la carte. Un
livrable illisible ne peut pas être validé, donc il ne vaut rien, quelle que soit la
qualité du travail derrière.

## Règle à appliquer

1. **Tout livrable — plan, rapport, review, résumé, description de PR — s'ouvre par un
   rappel de contexte de 2 à 5 lignes**, dès lors que le sujet n'a PAS été discuté
   auparavant **dans cette conversation**. Ce rappel répond à : de quoi on parle, où ça se
   passe (écran / endpoint / module), quel est l'état actuel, ce qui ne va pas, et pour qui.
2. **Le critère est la conversation, pas le dépôt.** Un fait « évident dans le code » n'est
   pas acquis : si je l'ai découvert dans un appel d'outil de ce tour, l'utilisateur ne l'a
   pas lu. Un fait dont on a parlé trois messages plus haut, lui, est acquis.
3. **Le contexte se dit en français, pas en références.** `party-response.dto.ts:120` n'est
   pas du contexte, c'est une **preuve**. La preuve vient APRÈS l'énoncé, jamais à sa place.
4. **Nommer les acteurs et les surfaces en clair** : « l'écran "Ta soirée" de l'onglet
   participation », pas « `PartyHubScreen` ». Le nom de classe entre parenthèses si utile.
5. **Un désaccord ou une correction se contextualise deux fois** : rappeler ce que l'autre
   a affirmé, puis ce que j'ai mesuré. « Je change ça de la reco du front » sans redire la
   reco est illisible.
6. **Test de relecture avant envoi** : un lecteur qui n'a rien vu de mes appels d'outils
   comprend-il le premier paragraphe ? Si non, le livrable commence trop loin dans le
   raisonnement — je remonte d'un cran et je réécris l'ouverture.
7. Complète `fix-raisonnement-neutre-en-prod-et-benefique-en-test-nommer-l-axe.md` : celle-là
   couvre « deux affirmations vraies qui se contredisent faute de nommer l'axe » ; celle-ci
   couvre « des affirmations vraies dont le lecteur n'a pas la prémisse ».

## Exemple

- ❌ **Avant (incorrect)** : « `PartyResponseDto` n'a que `organizerId: string`
  (party-response.dto.ts:120). `coOrganizers` est bien hydraté. Je renomme
  `CoOrganizerResponseDto` → `OrganizerResponseDto`… »
- ✅ **Après (correct)** : « **Le problème.** Sur la page d'une soirée dans l'app, la ligne
  sous le titre doit dire qui l'organise. Elle n'affiche jamais rien. Le backend envoie
  l'identité complète des co-organisateurs (pseudo, avatar) mais, pour le créateur de la
  soirée, seulement son identifiant — ni pseudo ni avatar. L'app a le champ prêt depuis des
  mois, il arrive toujours vide, donc le nom s'efface. Le détail mesuré est plus bas. »
