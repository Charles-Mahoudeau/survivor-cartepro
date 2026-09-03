# RULE : Ne jamais éditer en place un binaire propriétaire (.numbers/.key/.pages) — passer par un export texte (CSV/XLSX)

## Contexte

On m'a demandé de réviser un fichier `.numbers` (Apple Numbers, format IWA =
protobuf + Snappy zippés). La lib `numbers-parser` **lit** bien le fichier, mais
**plante à la sauvegarde** (bug `stroke_sidecar` sur Numbers 14.5). J'ai contourné
par un monkeypatch neutralisant les bordures, écrit dans le fichier, et annoncé
« vérifié » — alors que ma seule vérif était que la **même lib** rouvrait le fichier.
Numbers.app, lui, refusait le résultat (corrompu). En prime, mon process a écrasé/
altéré le backup que j'avais créé (318593 → 318544 octets), supprimant le filet.

## Erreur commise

- Édition **en place** d'un binaire propriétaire via un hack (monkeypatch) produisant
  un fichier non conforme au logiciel natif.
- **Fausse vérification** : « le fichier se rouvre » testé avec l'outil qui l'a écrit,
  pas avec le logiciel cible → conclusion « OK » erronée et communiquée comme certaine.
- **Backup non fiable** : altéré par le process, donc aucun vrai rollback possible.

## Cause racine

Supposer qu'un round-trip read/write d'une lib tierce = compatibilité avec le logiciel
propriétaire. Les formats IWA (Numbers / Keynote / Pages) ne sont **pas spécifiés
publiquement** ; toute écriture par lib tierce est au mieux best-effort (perte de
formatage/données), au pire corruptrice.

## Règle à appliquer

1. **Ne jamais écrire/éditer en place un `.numbers`, `.key`, `.pages`** (ni autre binaire
   propriétaire non spécifié) avec une lib tierce. La **lecture** est OK ; l'**écriture**, NON.
2. Pour modifier le contenu : travailler sur un **export texte** — **CSV** (ou **XLSX** si
   formules/styles nécessaires) — produire le livrable dans ce format, et laisser
   l'utilisateur réimporter vers le binaire s'il le souhaite.
3. **Ne jamais conclure « vérifié » sur un binaire** en se basant sur la lib qui l'a écrit.
   Une vérif valable = ouverture par le **logiciel cible** (que je ne peux pas faire) →
   donc par défaut, considérer toute écriture binaire propriétaire comme **NON sûre**.
4. Avant toute opération risquée : **backup immuable** (copie horodatée), et **vérifier le
   backup** (taille + hash) **avant ET après** l'opération, sans jamais le laisser dans le
   chemin d'écriture du process.

## Exemple

- ❌ **Avant (incorrect)** : `numbers-parser` + monkeypatch → `doc.save('spec.numbers')`
  → « zip OK, se rouvre → vérifié » (faux : Numbers refuse le fichier).
- ✅ **Après (correct)** : lire la table via `numbers-parser`, appliquer les révisions en
  mémoire, écrire **`spec.csv`** (texte, contrôlé byte à byte), livrer le CSV ; **ne pas
  toucher** le `.numbers`.
