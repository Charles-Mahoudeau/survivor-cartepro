# RULE : Corps de commit — chaque ligne ≤ 200 caractères (commitlint `body-max-line-length`)

## Contexte

En committant la feature profil (city/university + listes d'abonnés), j'ai passé
le corps du commit en **une seule longue ligne** via un `git commit -m "<corps>"`.
Le hook `commit-msg` (commitlint + husky) a rejeté le commit :
`body's lines must not be longer than 200 characters [body-max-line-length]`.

## Erreur commise

Corps de commit contenant une ligne de plus de 200 caractères → commit bloqué par
husky/commitlint, obligeant à recommencer le commit.

## Cause racine

`commitlint.config.ts` du projet applique la règle `body-max-line-length` (limite
200). Un `-m "..."` long produit **une seule ligne non wrappée** qui dépasse la
limite. La contrainte porte sur la longueur de **chaque ligne** du corps, pas du
corps entier.

## Règle à appliquer

1. **Chaque ligne du corps d'un commit doit faire ≤ 200 caractères.** (Le header
   Conventional Commits reste lui soumis à `header-max-length`, plus court.)
2. Avec `git commit -m`, **un `-m` par PHRASE, jamais par paragraphe.** Chaque
   `-m` devient **une ligne** dans le corps : un paragraphe de deux ou trois
   phrases courtes dépasse donc les 200 caractères alors que chaque phrase, prise
   seule, est largement dessous. Le paragraphe n'est pas l'unité — la ligne l'est.
3. **Viser ≤ 160 caractères par `-m`**, pas 200. La limite est un mur, pas une
   cible : à 190 on ne sait plus sans compter, à 160 on sait.
4. En cas de doute, préférer des phrases courtes / plusieurs `-m`.

## Exemple

- ❌ **Avant (incorrect)** :
  `git commit -m "feat(x): ..." -m "<une phrase de ~210 caractères ...>"` → rejeté
  par `body-max-line-length`.
- ✅ **Après (correct)** :
  `git commit -m "feat(x): ..." -m "<phrase 1 < 200>" -m "<phrase 2 < 200>"`.

## Cas connexe : un `#<num>` dans le corps déclenche le parsing FOOTER (limite 100)

En committant la migration party (drop `party_image`), un `-m` du corps contenait
`(issue typeorm/typeorm#7814)`. commitlint a rejeté :
`footer's lines must not be longer than 100 characters [footer-max-line-length]`.

Cause : le token `#7814` (référence d'issue) fait que le parser conventional-commits
classe la/les ligne(s) concernée(s) comme **footer**, soumis à `footer-max-line-length`
= **100** (et non 200 comme le body). Une ligne de corps parfaitement valide (< 200)
bascule ainsi sous la limite footer plus stricte dès qu'elle contient un `#<numéro>`.

Règle : **ne pas mettre de référence `#<numéro>` dans le corps** d'un commit sauf à
garder la ligne ≤ 100. Pour citer une issue/PR sans déclencher le footer, écrire le
numéro **sans `#`** (ex. « a known TypeORM limitation », « TypeORM issue 7814 »). Un
vrai footer voulu (`BREAKING CHANGE:`, `Refs: #123`) doit rester ≤ 100 par ligne.

## Récidive (2026-09-01) — deux rejets dans la même session, à cause du mot « paragraphe »

Sur la PR du seed de review, le hook `commit-msg` a rejeté **deux** commits d'affilée,
les deux sur `body-max-line-length`. À chaque fois j'avais bien découpé le corps en
plusieurs `-m` — mais **un `-m` par paragraphe**, exactement comme le point 2 le disait
alors. Un paragraphe de trois phrases de 70 caractères fait 217 caractères sur une
ligne : rejeté.

La règle telle qu'elle était écrite ne protégeait donc pas — elle nommait la mauvaise
unité. « Chaque phrase nettement sous 200 caractères » est vrai et sans effet quand
trois de ces phrases atterrissent sur la même ligne. Corrigé aux points 2 et 3
ci-dessus : l'unité est la **phrase**, la cible est **160**.

- ❌ **Avant (incorrect)** : `-m "<phrase 1>. <phrase 2>. <phrase 3>."` → une ligne de
  217 caractères → `husky - commit-msg script failed`.
- ✅ **Après (correct)** : `-m "<phrase 1>." -m "<phrase 2>." -m "<phrase 3>."` → trois
  lignes, chacune sous 160.
