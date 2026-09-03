# RULE : Ne jamais raisonner sur le contenu d'un fichier non réellement lu

## Contexte

Lors d'un refactor du module `user`, plusieurs appels `Read` ont échoué silencieusement
(retour « File does not exist » à cause de mauvais chemins), et `src/libs/database`
n'existait pas. Au lieu de m'arrêter, j'ai « imaginé » le contenu des fichiers et
construit un plan complet sur un modèle Drizzle fictif (`displayName`, `bio`, `authId`,
`isActive`) alors que le vrai code utilise **TypeORM** avec des champs totalement
différents (`username`, `firstName`, `age`, `sex`, `birthDate`…). J'ai même posé une
question à l'utilisateur basée sur ce modèle inventé.

## Erreur commise

- Avoir traité des `Read` en échec / vides comme s'ils avaient renvoyé du contenu.
- Avoir déduit la stack (Drizzle) à partir d'un skill chargé, sans vérifier sur les
  fichiers réels (la stack réelle est TypeORM).
- Avoir batché un glob shell faillible (`printf .../schema/*`) avec des `Write`/`rm`
  critiques : l'erreur du glob a annulé toute la batch (heureusement, sinon j'écrivais
  des fichiers faux).

## Cause racine

Confiance dans une représentation mentale du code au lieu de la sortie réelle des
outils. Un skill décrit un projet de référence — il ne décrit pas forcément CE projet.

## Règle à appliquer

1. **Aucune affirmation ni décision sur un fichier sans une lecture `Read` qui a
   réellement renvoyé son contenu.** Un retour « File does not exist », vide, ou une
   erreur = STOP : relocaliser le fichier (`Glob`/`find`) avant de continuer. Ne jamais
   « combler » le contenu manquant par déduction.
2. **Vérifier la stack réelle sur les fichiers du projet avant d'appliquer un skill
   d'architecture.** Un skill peut décrire une autre stack (ex : Drizzle/`@SmartModule`)
   que celle du repo (ex : TypeORM/`@Module`). Suivre le code réel ; n'emprunter au
   skill que ses principes agnostiques (SRP, repo = seule couche DB, naming sans préfixe
   redondant, exports minimaux).
3. **Ne jamais batcher dans le même bloc un appel faillible (glob sans match, commande
   au exit non‑zéro) avec des `Write`/`Edit`/`rm`.** Séparer la reconnaissance de
   l'écriture.

## Exemple

- ❌ **Avant (incorrect)** : `Read` renvoie « File does not exist » → je continue en
  supposant que le modèle a `id`, `authId`, `email`, `bio` et je code dessus.
- ✅ **Après (correct)** : `Read` échoue → `find`/`Glob` pour trouver le vrai chemin →
  `Read` le vrai fichier → je constate TypeORM + `username`/`firstName`/… → je code sur
  le réel.
