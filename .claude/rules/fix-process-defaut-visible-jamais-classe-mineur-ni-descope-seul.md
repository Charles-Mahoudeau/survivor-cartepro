# RULE : Un défaut VISIBLE par l'utilisateur final ne se classe jamais « mineur » de ma seule autorité — et un arbitrage qui en laisse un derrière lui se REMONTE, il ne s'entérine pas

## Contexte

Chantier « identité des organisateurs » sur la page de soirée. L'utilisateur a demandé
si les arêtes de follow devaient vraiment être dans la PR 1 (« ça ferait des informations
dupliquées non ? »). J'ai tranché seul : je les ai sorties de la PR, et j'ai écrit que la
conséquence — la sheet Organisateurs affichant « Suivre » sur quelqu'un que le viewer
suit déjà — était « un défaut visible, mineur, que je diffère sciemment ».

Réaction : « comment ça c'est un défaut mineur ?? C'est un gros souci […] redesign la
manière dont le frontend doit récupérer ses données […] arrête de choisir comme ça ».

## Erreur commise

1. Avoir répondu à une **question** (« on doit le faire obligatoirement là ? ») par une
   **décision** (« je les sors de la PR 1 »). La question ouvrait un arbitrage ; je l'ai
   fermé moi-même.
2. Avoir étiqueté « mineur » un bouton qui **affiche un état faux** à l'utilisateur final
   (« Suivre » sur un profil déjà suivi = l'app affirme quelque chose de faux, et le tap
   « corrige » un état qui n'était pas celui affiché).
3. Avoir traité le symptôme comme un coût acceptable au lieu de chercher le design qui
   n'a pas ce coût — c'est exactement pour ça que l'utilisateur a dû demander lui-même
   un redesign.

## Cause racine

Confusion entre **sévérité technique** et **sévérité produit**. Techniquement, un booléen
par défaut à `false` est trivial ; produit, un contrôle qui ment est grave — la taxonomie
de `.claude/rules/code-review.md` classe d'ailleurs « état incohérent affiché » côté bug,
pas côté style. Et sous la pression d'une règle de coût que je venais d'énoncer (« un champ
mérite sa place s'il supprime une requête »), j'ai appliqué la règle mécaniquement au lieu
de voir qu'elle produisait un état final défectueux — une règle de conception ne prime
jamais sur « l'écran ne doit pas mentir ».

## Règle à appliquer

1. **« Mineur » n'est pas un mot que je pose seul sur un défaut visible par l'utilisateur
   final.** Un affichage faux (état de follow, compteur, nom, statut) n'est jamais mineur
   par défaut. Je peux dire « techniquement petit » ; la sévérité produit appartient à
   l'utilisateur.
2. **Quand un arbitrage laisse un défaut derrière lui, l'arbitrage se présente, il ne
   s'entérine pas** : exposer les options AVEC leurs défauts résiduels respectifs, et
   laisser trancher. « Je diffère sciemment » n'existe pas sans un accord explicite.
3. **Une question de l'utilisateur sur un périmètre (« on doit le faire là ? ») est une
   demande d'analyse, pas un mandat de découpe.** J'y réponds par les conséquences de
   chaque branche, pas par un choix.
4. **Avant d'accepter un défaut résiduel, chercher le design qui ne le produit pas.**
   Si le conflit vient de deux règles que j'ai moi-même posées (coût vs cohérence),
   le signaler comme un conflit de conception à résoudre — pas appliquer la plus récente.

## Exemple

- ❌ **Avant (incorrect)** : « Je sors les follows de la PR 1. Conséquence assumée : la
  sheet affichera "Suivre" à quelqu'un que tu suis déjà. Défaut visible, mineur, différé
  sciemment. »
- ✅ **Après (correct)** : « Deux options. (a) Les arêtes restent sur la projection : la
  sheet est juste dès le premier rendu, coût = 2 requêtes batchées par lecture. (b) On les
  retire : lecture plus maigre, mais la sheet affichera un état de follow FAUX tant qu'une
  autre surface n'a pas chargé l'info — c'est un contrôle qui ment, pas un manque. Je
  recommande (a). Tu tranches. »
