# RULE : Une incohérence repérée se REWORK, même si elle est pré-existante — jamais l'étendre en silence

## Contexte

Pendant la lane read-enrichment (parcours rejoindre v3), l'agent a dû étendre
`feed-hydration.helper.ts`, un fichier qui faisait déjà du **SQL brut dans un helper**
(double violation des conventions du repo : SQL manuscrit + hors repo). Il a **suivi le
pattern du fichier** et étendu le SQL brut (nouveau LATERAL + CASE). En revue, j'ai
défendu ce choix par « le pattern est pré-existant, la PR ne l'a pas introduit ».
L'utilisateur a tranché : le pré-existant n'est pas une excuse — une incohérence vue
doit être retravaillée.

## Erreur commise

1. Avoir **étendu** un pattern non conforme au lieu de le remettre en cause au moment où
   on travaillait dessus.
2. Avoir traité « c'est pré-existant » comme une justification suffisante en revue, en
   reléguant la correction à un ticket de dette sans poser la question.

## Cause racine

Confusion entre deux principes : « minimal diff / YAGNI » (ne pas faire ce qui n'est pas
demandé) et « ne pas toucher au legacy ». Le minimal diff porte sur le **périmètre
fonctionnel**, pas sur la qualité : quand on travaille DANS un fichier incohérent, la mise
en conformité de ce qu'on touche fait partie du travail. Chaque extension d'un mauvais
pattern augmente le coût de sa résorption.

## Règle à appliquer

1. **Toute incohérence repérée** (violation des conventions du repo, des `.claude/rules/`,
   du skill d'architecture : SQL brut, doc dupliquée, magic values, naming préfixé, couche
   contournée…) **doit être traitée, même si elle est antérieure au travail en cours.**
   « Le fichier faisait déjà comme ça » n'est jamais une justification pour l'étendre.
2. **Évaluer l'impact du rework avant d'agir** :
   - **Incohérence flagrante + impact contenu** (le fichier/module courant, comportement
     identique, gates capables de le prouver) → **refactorer directement**, dans un commit
     dédié séparé du changement fonctionnel.
   - **Impact fort** (rayon large : plusieurs modules, chemin critique type feed/paiement,
     migration, risque de changement de comportement, grosse suite de tests à revalider)
     → **STOP, demander à l'utilisateur** avec le constat, l'option de rework et son coût.
   - **Doute sur la frontière** entre les deux → demander aussi. Demander est toujours
     autorisé ; étendre en silence ne l'est jamais.
3. **Dans tous les cas, l'incohérence est signalée explicitement** (dans la PR / le
   rapport), même quand le rework est différé sur décision — jamais découverte par
   l'utilisateur en revue.
4. Cette règle s'applique aussi aux **sous-agents** : leurs briefs doivent la porter, et
   un agent qui rencontre une incohérence à impact fort la remonte dans son rapport au
   lieu de l'étendre.

## Exemple

- ❌ **Avant (incorrect)** : le fichier fait du SQL brut → j'ajoute mon LATERAL au SQL
  brut « pour rester cohérent avec le fichier », et la revue découvre le problème.
- ✅ **Après (correct, impact fort)** : « `feed-hydration.helper.ts` viole la règle
  QueryBuilder-dans-un-repo. Le rework touche le chemin de lecture du feed entier
  (impact fort). Options : (a) je migre maintenant vers un repo+QB dans un commit dédié,
  (b) j'étends a minima et on migre en refacto dédié juste après. Tu préfères ? » —
  décision utilisateur, puis exécution.
- ✅ **Après (correct, impact contenu)** : une URL hardcodée inline dans le fichier que je
  modifie → je la passe en constante nommée dans la foulée, commit `refactor(...)` séparé.
