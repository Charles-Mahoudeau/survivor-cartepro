# RULE : Une convention se dérive d'un échantillon REPRÉSENTATIF (≥ 3, dont les plus récents) — jamais d'un seul exemple

## Contexte

L'utilisateur m'a demandé de créer une issue Linear « en suivant ce qui est déjà en place
avec les autres issues », puis d'en pousser un template. J'ai listé les 25 issues
existantes (titres, labels, priorités, statuts) — donc j'avais bien la vue d'ensemble —
puis j'ai ouvert **deux** descriptions complètes : YNO-123 et YNO-128. YNO-128 n'était
qu'une phrase. J'ai donc calqué le format sur **YNO-123** seul :

```
## Scope backend
## Critères d'acceptation (backend)
```

et j'ai écrit à la fois l'issue YNO-130 et le document « Template » sur cette base.
L'utilisateur a corrigé : « ça ne respecte pas du tout ce format », en donnant le vrai :
`User Story` (« En tant que…, je veux…, afin que… ») + `Critères d'acceptation` + `Notes`.

En rouvrant YNO-120, YNO-111 et YNO-116 après coup, c'était net : les trois portent
`## User story` (ou `## Symptôme` pour un bug) puis `## Critères d'acceptation`.
**YNO-123 est la variante SOUS-TÂCHE** — un enfant de YNO-120, qui ne répète pas la user
story du parent. J'avais donc pris l'exception pour la règle, et l'avais gravée dans un
template destiné à faire autorité.

## Erreur commise

Avoir dérivé un **format canonique** — puis un **template prescriptif** — d'un seul
échantillon, sans vérifier qu'il était représentatif. Aggravant : le template a été poussé
sur Linear comme « source de vérité », donc l'erreur allait se propager à toutes les issues
suivantes, humaines comprises.

Second aggravant : j'ai écrit dans le document « elle décrit ce qui est déjà en place
(YNO-105 → YNO-130), elle ne l'invente pas » — une affirmation de couverture large adossée
à **une** lecture. La formulation rassurante a masqué la faiblesse de la mesure, pour
l'utilisateur comme pour moi.

## Cause racine

Confusion entre **avoir vu la liste** et **avoir lu le contenu**. Les métadonnées (titres,
labels, statuts) étaient bien échantillonnées sur 25 items ; le **corps** des issues, lui,
ne l'était que sur 1. J'ai transféré la confiance du premier échantillon au second.

Et je n'ai pas cherché la structure du corpus avant de généraliser : une issue **parent**
et une issue **sous-tâche** n'ont pas le même gabarit. Tomber sur une sous-tâche et en
faire la norme, c'est ignorer que le corpus a des classes. Un échantillon de 1 ne peut
jamais révéler qu'il existe plusieurs classes — par construction.

## Règle à appliquer

1. **Avant de codifier une convention (template, règle, générateur, brief), lire au moins
   TROIS instances complètes**, dont les plus récentes, et vérifier qu'elles convergent. Si
   elles divergent, la divergence _est_ l'information : chercher la classe (parent vs
   sous-tâche, feature vs bug, ancien vs nouveau) avant d'écrire quoi que ce soit.
2. **Une instance isolée qui diffère des autres est traitée comme une VARIANTE à
   comprendre, jamais comme la norme.** Se demander explicitement : « qu'est-ce qui, dans
   cet item, le rend différent ? » — le plus souvent la réponse est structurelle.
3. **Quand l'utilisateur a manifestement un format en tête** (« suis ce qui est déjà en
   place »), le lui **demander** ou lui **montrer le squelette retenu avant de l'appliquer
   en masse**, plutôt que de l'inférer et de le pousser comme référence. Le coût d'une
   question est nul ; le coût d'un template faux devenu autorité est payé par tout le monde.
4. **Ne jamais écrire une affirmation de couverture qu'on n'a pas mesurée.** « Dérivé de
   YNO-105 → YNO-130 » exige d'avoir lu cette plage. Sinon on écrit ce qu'on a réellement
   fait : « dérivé de YNO-111, YNO-116 et YNO-120 ».
5. Corollaire des règles voisines : `fix-raisonnement-ne-pas-halluciner-contenu-fichier.md`
   couvre « je n'ai pas lu » ; `fix-raisonnement-invariant-delegue-doit-etre-calcule.md`
   couvre « j'ai lu et bien analysé, mais j'ai paraphrasé faux » ; celle-ci couvre
   **« j'ai lu UN cas et je l'ai généralisé »**.

## Exemple

- ❌ **Avant (incorrect)** : j'ouvre YNO-123, j'y vois `## Scope backend` +
  `## Critères d'acceptation (backend)`, j'en fais le template officiel poussé sur Linear.
  (YNO-123 est une sous-tâche : l'exception.)
- ✅ **Après (correct)** : j'ouvre YNO-120, YNO-111 et YNO-116 → les trois portent
  `## User story` (ou `## Symptôme`) + `## Critères d'acceptation` → c'est la norme ;
  YNO-123 s'explique comme **variante sous-tâche** et est documentée comme telle dans le
  template, à sa place.
