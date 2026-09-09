# CartePro, journal d'audit — note d'intégrité

Ministère du Job et Bonheur, Direction Numérique et Innovation
Référence du cahier des charges : JEB/DNI/2026-002
Réf. courrier : Thomas Vignal, Cabinet du Ministre, Direction Numérique, 8 septembre 2026

## Démarrage du journal sur une base déjà peuplée

Le journal commence à exister aujourd'hui ; la base porte une semaine
d'activité qui le précède (partenaires déjà validés, abondements déjà
appliqués). Il est exclu d'inventer des écritures antérieures pour combler
cette semaine : ce serait exactement la fraude que le dispositif existe pour
rendre visible. La chaîne démarre donc par un enregistrement d'origine, écrit
une seule fois, qui déclare que le journal commence ici et que l'activité qui
précède n'y est pas représentée. Ce premier enregistrement porte l'action
`admin_action`, la cible `audit_chain`, et un `previousHash` nul — c'est le
seul enregistrement de toute la chaîne à en avoir un.

## Mécanisme d'intégrité

Chaque enregistrement porte le SHA-256 de ses propres champs, concaténés dans
cet ordre exact, séparés par `|` : `actorId`, `actorRole`, `action`,
`targetType`, `targetId`, `payload` (JSON à clés triées récursivement — les
objets `jsonb` de PostgreSQL ne préservent pas l'ordre d'écriture des clés, la
comparaison doit donc en être indépendante), `ip`, `previousHash`. Ce dernier
est le `hash` de l'enregistrement immédiatement précédent, formant une chaîne :
modifier un champ d'un enregistrement change son propre `hash` et rompt le
lien porté par l'enregistrement suivant.

Deux altérations produisent deux signatures distinctes, volontairement :

- **Modification** d'un enregistrement existant → son `hash` recalculé ne
  correspond plus à celui enregistré. L'enregistrement fautif est désigné
  directement.
- **Suppression** d'un enregistrement → les deux enregistrements restants ont
  chacun un contenu intact (leur propre `hash` reste valide), mais le
  `previousHash` de celui qui suit ne correspond plus au `hash` de celui qui
  le précède désormais. La rupture est détectée sur ce lien, jamais confondue
  avec une modification.

`id`, l'identifiant, et `occurredAt`, l'horodatage, sont exclus du calcul :
tous deux sont attribués par la base au moment de l'écriture, après que le
`hash` a déjà dû être déterminé — la chaîne garantit qui a fait quoi à quoi,
pas un horodatage ou un identifiant que le stockage attribue lui-même.

## Garantie append-only

`REVOKE UPDATE, DELETE, TRUNCATE` retire à l'utilisateur applicatif tout droit
de modifier ou de vider la table `audit_log`, y compris `TRUNCATE` — au-delà
du strict `UPDATE, DELETE` du courrier, pour fermer la possibilité de vider la
table entière en une seule instruction. La garde tient même depuis une
connexion directe à la base avec cet utilisateur. Elle ne tient pas contre un
utilisateur réellement privilégié (super-utilisateur) : c'est un choix
délibéré, pas un oubli — un opérateur avec un tel accès peut légitimement
avoir besoin d'intervenir sur la base, et c'est précisément ce que la chaîne
de hachage est là pour détecter s'il en abuse. Le `REVOKE` empêche l'altération
depuis le code applicatif ; la chaîne détecte l'altération depuis un accès
privilégié.

## Vérifier une exportation

`GET /api/v1/admin/audit/export?from=…&to=…` (réservé aux administrateurs)
renvoie la période demandée signée en HMAC-SHA256 (clé `AUDIT_EXPORT_SIGNING_SECRET`,
lue dans l'environnement, jamais en dur), accompagnée du `hash` de son dernier
enregistrement comme condensé de la chaîne à cet instant.

Vérification, sans aucun accès à la base :

```bash
bun run audit:verify <export.json> --secret <clé>
```

La commande contrôle d'abord la signature (le fichier a-t-il été produit par
qui détient la clé, inchangé depuis), puis la chaîne à l'intérieur du fichier.
Elle rend un verdict `CONFORME` ou `NON CONFORME`, et dans ce second cas
désigne l'enregistrement exact et la nature de la rupture (modification ou
suppression).

## Granularité des actions et périmètre couvert

Le courrier cite dix libellés distincts pour « neuf opérations » ; l'enum
`AuditAction` garde les dix, séparés (création vs modification de compte,
validation vs refus de partenaire, transaction validée vs refusée) : un
enregistrement fusionné ne peut plus être scindé après coup, un enregistrement
fin peut toujours être regroupé à la lecture.

Couvertes et vérifiées : validation/refus de partenaire, application d'un
abondement, création d'employeur (`admin_action`), création de compte,
modification de compte, changement de rôle. Les deux dernières passent par les
hooks `databaseHooks` de Better Auth, qui sert ces routes hors du routage
Nest — le décorateur `@Audited` ne peut pas les atteindre.

Non couvertes dans ce délai : transaction validée/refusée (aucune route de
capture de paiement n'existe encore dans le code) et connexion échouée
(nécessite une exploration plus large de l'API de hooks génériques de Better
Auth, non conduite avec assez de confiance dans le temps imparti). Les deux
sont documentées ici plutôt que tues, conformément à la latitude explicitement
laissée par le courrier.
