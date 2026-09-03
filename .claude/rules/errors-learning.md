# RÈGLE : Auto-correction par création de rules

## Principe

Chaque fois que tu commets une erreur — de raisonnement, d'exécution, d'interprétation ou de comportement — tu **dois** créer une nouvelle rule dédiée pour empêcher cette erreur de se reproduire. L'objectif est de construire progressivement une base de connaissances corrective, propre à ce projet / cet utilisateur.

---

## Déclencheurs

Tu dois créer une rule corrective quand :

1. **Erreur de raisonnement** — Tu fais une déduction incorrecte, tu confonds deux concepts, tu appliques une logique erronée.
2. **Erreur d'exécution** — Un script ou une commande échoue à cause d'une mauvaise syntaxe, d'un mauvais chemin, d'un mauvais paramètre que tu as généré.
3. **Erreur d'interprétation** — Tu comprends mal la demande de l'utilisateur ou tu fais des hypothèses fausses sur le contexte.
4. **Erreur de format / output** — Tu produis un livrable dans le mauvais format, avec la mauvaise structure, ou qui ne respecte pas les conventions demandées.
5. **Erreur de process** — Tu oublies une étape, tu fais les choses dans le mauvais ordre, tu ignores une contrainte explicite.
6. **Régression** — Tu refais une erreur qui avait déjà été signalée ou corrigée.
7. **Correction par l'utilisateur** — L'utilisateur te corrige explicitement sur un point, même mineur.

---

## Procédure à suivre

### Étape 1 : Identifier et reconnaître l'erreur

Dès que tu détectes une erreur (par toi-même ou via un retour utilisateur) :

- Nomme l'erreur clairement.
- Explique brièvement ce qui s'est passé.
- Ne minimise pas, ne noie pas l'erreur dans des excuses.

### Étape 2 : Créer la rule corrective

Crée un fichier dans le dossier `rules/` (ou le dossier de rules du projet) avec le format suivant :

**Nom du fichier** : `rules/fix-[catégorie]-[description-courte].md`

**Contenu du fichier** :

```markdown
# RULE : [Titre court et descriptif]

## Contexte

[Qu'est-ce qui s'est passé ? Quel était le scénario ?]

## Erreur commise

[Description précise de l'erreur]

## Cause racine

[Pourquoi cette erreur s'est produite — mauvaise hypothèse, oubli, confusion, etc.]

## Règle à appliquer

[Instruction claire, impérative, actionnable que tu dois suivre désormais]

## Exemple

- ❌ **Avant (incorrect)** : [ce que tu as fait]
- ✅ **Après (correct)** : [ce que tu dois faire à la place]
```

### Étape 3 : Confirmer à l'utilisateur

Après création de la rule :

- Indique le nom du fichier créé.
- Résume la règle en une phrase.
- Reprends la tâche en appliquant immédiatement la correction.

---

## Règles sur les rules

- **Granularité** : Une rule = une erreur spécifique. Pas de rules fourre-tout.
- **Clarté** : La section "Règle à appliquer" doit être une instruction simple qu'on peut suivre sans contexte supplémentaire.
- **Pas de doublons** : Avant de créer une rule, vérifie qu'il n'en existe pas déjà une couvrant le même cas. Si oui, enrichis-la plutôt que d'en créer une nouvelle.
- **Nommage cohérent** : Utilise des catégories comme `raisonnement`, `execution`, `interpretation`, `format`, `process`, `api`, `powershell`, `graph`, `exchange`, etc.
- **Langue** : Écris les rules dans la langue de travail du projet (français par défaut).

---

## Exemples de rules qui pourraient être créées

| Fichier                                            | Règle résumée                                                  |
| -------------------------------------------------- | -------------------------------------------------------------- |
| `rules/fix-execution-pip-flag.md`                  | Toujours utiliser `--break-system-packages` avec pip           |
| `rules/fix-powershell-connect-graph.md`            | Toujours spécifier `-Scopes` lors de `Connect-MgGraph`         |
| `rules/fix-interpretation-csv-vs-xlsx.md`          | Demander confirmation du format de sortie si non précisé       |
| `rules/fix-process-lire-skill-avant-code.md`       | Toujours lire le SKILL.md avant de coder un livrable           |
| `rules/fix-format-encoding-utf8.md`                | Forcer l'encoding UTF-8 BOM pour les scripts PowerShell FR     |
| `rules/fix-raisonnement-scope-delegated-vs-app.md` | Distinguer permissions déléguées vs application dans Graph API |

---

## Priorité

Cette règle est **toujours active**. Elle s'applique en continu, à chaque interaction. La création d'une rule corrective ne doit jamais être reportée ou oubliée — elle fait partie intégrante du traitement de l'erreur.
