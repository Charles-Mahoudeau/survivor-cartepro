# RULE : Un défaut hors du périmètre de la PR se pose, il ne s'acte jamais

## Contexte

Pendant la PR d'authentification, une revue a fait remonter des défauts réels situés
**hors du périmètre de la PR** : une version codée en dur dans un contrôleur appartenant à
une autre PR déjà mergée, une règle de routage dans un artefact de déploiement écrit par
quelqu'un d'autre, des chaînes de marque périmées dans une spécification frontend. Chacun
était petit, visible, et corrigeable en une ligne. J'ai proposé de corriger le client
frontend et le fichier de déploiement d'autrui, au motif que la feature courante en
dépendait.

L'utilisateur a tranché : « tu ne touches Absolument pas au frontend, je le modifierai en
temps réel. Il faut les poser, mais jamais les acter. Sinon, on a des PR qui solvent
énormément d'issues mais qui en créent d'autres. »

## Erreur commise

Avoir traité « le défaut est réel et le correctif est trivial » comme une autorisation
d'élargir le diff à des fichiers que la PR n'avait aucune raison fonctionnelle d'ouvrir.

## Cause racine

Confusion entre « le défaut est réel » et « le défaut est à moi ». Une correction d'une
ligne dans le fichier d'un autre auteur élargit la surface de revue, brouille la
responsabilité du changement, et transforme une PR lisible en PR qui résout beaucoup et
casse ailleurs. Le coût d'une PR ne se mesure pas à la taille de son diff mais au nombre
de personnes qui doivent le relire et au nombre de sujets qu'elle mélange.

## Règle à appliquer

1. **Un défaut hors périmètre se pose : il se rapporte à l'utilisateur, et il devient une
   issue si on le demande. Il ne se corrige jamais dans la PR courante**, même en une
   ligne, même s'il est flagrant, même si les gates resteraient verts.
2. **Le frontend ne se touche jamais depuis une PR backend**, quelle qu'en soit la raison.
3. **Le fichier appartenant à une autre PR — ouverte ou déjà mergée — ne se modifie pas**
   pour faire fonctionner la feature courante.
4. **Quand un défaut hors périmètre rend la feature courante non fonctionnelle**, c'est un
   point de blocage : présenter le constat, les options et leur coût respectif, puis
   laisser trancher. Ne jamais choisir seul entre « je déborde » et « je livre cassé ».
5. Cette règle **borne** `fix-process-rework-incoherences-preexistantes.md`, elle ne
   l'annule pas. Cette dernière gouverne le code que la PR possède déjà : une incohérence
   dans un fichier qu'on modifie de toute façon se retravaille. Le hors-périmètre commence
   là où la PR n'a aucune raison fonctionnelle d'ouvrir le fichier.

## Exemple

- ❌ **Avant (incorrect)** — dans une PR d'authentification :
  - « le contrôleur de santé renvoie une version codée en dur, je corrige au passage » ;
  - « la règle de routage n'expose pas `/auth`, j'ajoute le `PathPrefix` dans l'artefact ».
- ✅ **Après (correct)** : les deux sont rapportés avec leur scénario de casse ; l'un
  devient une issue, l'autre devient une question bloquante posée à l'utilisateur. Le diff
  de la PR d'authentification ne contient ni l'un ni l'autre.
