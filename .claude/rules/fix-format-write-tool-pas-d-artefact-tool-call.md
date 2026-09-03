# RULE : Ne jamais laisser un artefact d'appel d'outil dans le CONTENU ecrit par Write

## Contexte

En ecrivant un fichier PLAN.md long avec l'outil `Write`, le `content` a ete tronque
en plein milieu d'un bloc de verification, et un fragment de la SYNTAXE d'appel d'outil
(balise de fermeture d'invocation, balise de parametre) a ete colle DANS le texte du
fichier. Le fichier ecrit etait donc malforme (balise XML non fermee + artefact parasite).
L'erreur s'est reproduite une fois de plus en ecrivant la rule corrective elle-meme.

## Erreur commise

- Avoir produit un `content` Write tronque / interrompu, laissant une balise ouverte
  (`<automated>` sans fermeture) et un fragment de la mecanique d'appel d'outil
  (`</invoke>`, `<parameter ...>`) a l'interieur meme du contenu du fichier livre.
- Ne pas avoir relu le rendu final du gros bloc de contenu avant de passer a la suite.

## Cause racine

Sur un `content` tres long contenant lui-meme beaucoup de balises de type XML
(`<task>`, `<verify>`, `<automated>`, `<action>`), la frontiere entre le CONTENU du
fichier et la SYNTAXE d'invocation de l'outil se brouille : un bloc XML interne mal
ferme ou une troncature fait deraper la generation et un bout de la syntaxe d'appel
finit dans le payload. C'est un risque accru sur les fichiers GSD (PLAN.md, etc.) qui
sont eux-memes pleins de pseudo-XML.

## Regle a appliquer

1. **Le `content` passe a `Write` ne doit JAMAIS contenir de fragment de la syntaxe
   d'appel d'outil** (aucune balise de fermeture d'invocation, aucune balise
   `<parameter ...>`, aucun JSON d'appel tronque). Ce sont des artefacts de la mecanique
   d'outil, jamais du contenu de fichier.
2. **Chaque balise ouverte dans le contenu doit etre fermee** : tout `<verify>` a son
   `</verify>`, tout `<automated>` a son `</automated>`, tout `<task ...>` a son `</task>`.
   Le contenu doit etre complet et auto-coherent du premier au dernier caractere.
3. **Pour un fichier long et dense en balises** (PLAN.md GSD et assimiles) : preferer
   construire le contenu en une seule passe complete et continue ; ne jamais "couper"
   au milieu d'un bloc. Si le contenu est trop gros pour une seule generation fiable,
   ecrire d'abord une base complete et valide, puis l'etendre par des `Edit` cibles
   (jamais par un `Write` partiel qui laisse des balises ouvertes).
4. **Apres un Write de gros contenu, controler la fin du fichier** : verifier que le
   dernier bloc est bien ferme et qu'aucun artefact d'appel ne s'y trouve (un `grep`
   du nom de balise d'invocation ou un coup d'oeil aux dernieres lignes suffit), AVANT
   de passer a l'etape suivante.

## Exemple

- (X) Avant (incorrect) : `Write content="... <verify><automated>cmd ...` (le contenu
  s'arrete net, `<automated>` jamais ferme, et un fragment de syntaxe d'invocation
  d'outil apparait dans le texte du fichier).
- (V) Apres (correct) : `Write content="... <verify><automated>cmd</automated></verify>
</task></tasks> ... <output>...</output>"` (toutes les balises fermees, zero artefact
  d'appel, contenu complet de bout en bout) ; puis verification rapide de la fin du fichier.
