# Démonstration d'altération détectée (avant/après)

Ministère du Job et Bonheur, Direction Numérique et Innovation
Référence du cahier des charges : JEB/DNI/2026-002
Destinataire : Thomas Vignal, Cabinet du Ministre, Direction Numérique — c'est ce document,
tel quel, qui lui est transmis, et qu'il transmet à son tour à la Cour des comptes.

Ce dossier contient le vrai livrable demandé : une altération réellement détectée sur le
journal d'audit, pas du code qui prétendrait la détecter. Les sorties ci-dessous sont
authentiques — capturées en exécutant, dans l'ordre, exactement les commandes affichées,
contre une copie isolée de la base (un conteneur PostgreSQL local, dédié à cette
démonstration, distinct de toute base de développement partagée). Le mécanisme lui-même
— chaîne de hachage, `REVOKE`, commande `audit:verify` — est décrit dans
[`docs/audit-integrity-note.md`](../audit-integrity-note.md) ; ce document-ci ne fait que
le mettre à l'épreuve.

## Ce qui est démontré

Le journal contient quatre enregistrements : l'origine de la chaîne (créée automatiquement
au démarrage de l'application) puis trois créations de compte. Le deuxième enregistrement
après l'origine — ni le premier, ni le dernier, un enregistrement **au milieu du journal** —
est pris pour cible dans les deux scénarios :

| Champ                   | Valeur                                         |
| ----------------------- | ---------------------------------------------- |
| `id`                    | `01a08a54-d75d-7de9-96da-e1a356896ffc`         |
| Position dans la chaîne | 3ᵉ enregistrement sur 4 (index `#2`, 0-indexé) |
| `action` d'origine      | `account_created`                              |
| `occurred_at`           | 2026-09-10 08:00:11 UTC                        |

Deux scénarios, chacun rejoué depuis une chaîne intacte (la base est restaurée depuis une
sauvegarde prise juste avant toute altération, entre les deux scénarios) :

1. **Modification** — un seul champ (`action`) de cet enregistrement est changé.
2. **Suppression** — le même enregistrement est effacé.

Dans les deux cas :

- la vérification sur la chaîne intacte rend **`VERDICT : CONFORME`** ;
- l'altération est appliquée avec un utilisateur PostgreSQL **privilégié**
  (`cartepro`, propriétaire du schéma) — jamais avec l'utilisateur applicatif
  (`cartepro_app`), qui n'a plus le droit d'écrire sur `audit_log` depuis le `REVOKE`
  de la migration `CreateAuditLog`. Ce refus est lui-même vérifié en direct avant chaque
  altération, ci-dessous ;
- la vérification relancée après l'altération rend **`VERDICT : NON CONFORME`** et
  **désigne l'enregistrement exact** — jamais un simple constat global.

## Scénario 1 — Modification d'un champ

### Avant : la chaîne est intacte

```
$ bun run audit:verify export-avant.json --secret <clé>
```

Sortie réelle ([`scenario-1-modification/verify-avant.txt`](scenario-1-modification/verify-avant.txt)) :

```
$ bun scripts/audit-verify.ts "export-avant.json" --secret "***"

Fichier :  export-avant.json
Période :  2026-08-11T08:01:13.383Z → (ouverte)
Signature: valide
Chaîne :   4 enregistrement(s) vérifié(s)

VERDICT : CONFORME
```

### L'altération — commande montrée

D'abord, la preuve que l'utilisateur applicatif ne peut pas faire ce qui suit, même en se
connectant directement à la base (le `REVOKE` tient hors du code applicatif aussi) :

```
$ psql -U cartepro_app -d cartepro -c "UPDATE audit_log SET action = 'admin_action' WHERE id = '01a08a54-d75d-7de9-96da-e1a356896ffc';"
ERROR:  permission denied for table audit_log
```

Puis l'altération, avec l'utilisateur privilégié qui possède le schéma :

```
$ psql -U cartepro -d cartepro -c "UPDATE audit_log SET action = 'admin_action' WHERE id = '01a08a54-d75d-7de9-96da-e1a356896ffc';"
UPDATE 1
```

Un seul champ (`action`) d'un seul enregistrement (`01a08a54-d75d-…`), au milieu du
journal — rien d'autre n'a été touché.

### Après : la chaîne est ré-exportée puis re-vérifiée

```
$ bun run audit:verify export-apres.json --secret <clé>
```

Sortie réelle ([`scenario-1-modification/verify-apres.txt`](scenario-1-modification/verify-apres.txt)) :

```
$ bun scripts/audit-verify.ts "export-apres.json" --secret "***"

Fichier :  export-apres.json
Période :  2026-08-11T08:02:16.380Z → (ouverte)
Signature: valide
Chaîne :   4 enregistrement(s) vérifié(s)

VERDICT : NON CONFORME
├─ Enregistrement #2 (id 01a08a54-d75d-7de9-96da-e1a356896ffc) modifié : son contenu ne correspond plus à son empreinte enregistrée.

error: script "audit:verify" exited with code 1
```

La commande désigne directement l'enregistrement `01a08a54-d75d-…` — celui-là même qui a
été modifié, pas un autre, et pas un simple « la chaîne est cassée quelque part ».

## Scénario 2 — Suppression d'un enregistrement

Entre les deux scénarios, la base a été restaurée depuis la sauvegarde prise avant le
scénario 1 : le journal repart intact, avec le même enregistrement `01a08a54-d75d-…` de
nouveau présent et intact.

### Avant : la chaîne est de nouveau intacte

Sortie réelle ([`scenario-2-suppression/verify-avant.txt`](scenario-2-suppression/verify-avant.txt)) :

```
$ bun scripts/audit-verify.ts "export-avant.json" --secret "***"

Fichier :  export-avant.json
Période :  2026-08-11T08:02:59.685Z → (ouverte)
Signature: valide
Chaîne :   4 enregistrement(s) vérifié(s)

VERDICT : CONFORME
```

### L'altération — commande montrée

Même contrôle d'abord :

```
$ psql -U cartepro_app -d cartepro -c "DELETE FROM audit_log WHERE id = '01a08a54-d75d-7de9-96da-e1a356896ffc';"
ERROR:  permission denied for table audit_log
```

Puis la suppression, avec l'utilisateur privilégié :

```
$ psql -U cartepro -d cartepro -c "DELETE FROM audit_log WHERE id = '01a08a54-d75d-7de9-96da-e1a356896ffc';"
DELETE 1
```

### Après : la chaîne est ré-exportée puis re-vérifiée

Sortie réelle ([`scenario-2-suppression/verify-apres.txt`](scenario-2-suppression/verify-apres.txt)) :

```
$ bun scripts/audit-verify.ts "export-apres.json" --secret "***"

Fichier :  export-apres.json
Période :  2026-08-11T08:03:16.435Z → (ouverte)
Signature: valide
Chaîne :   3 enregistrement(s) vérifié(s)

VERDICT : NON CONFORME
├─ Rupture avant l'enregistrement #2 (id 01a08a54-f704-75bd-8229-9a652f77203c) : un enregistrement qui devait le précéder est absent.

error: script "audit:verify" exited with code 1
```

Ici la commande ne peut pas désigner l'enregistrement supprimé — il n'existe plus dans
l'export. Elle désigne à la place, exactement comme prévu par
[la note d'intégrité](../audit-integrity-note.md#mécanisme-dintégrité), l'enregistrement
**suivant** (`01a08a54-f704-…`, le 4ᵉ de la chaîne d'origine), dont le `previousHash` ne
correspond plus à rien de présent dans l'export : la rupture est bien localisée entre les
deux enregistrements encadrant celui qui a disparu, jamais confondue avec une simple
modification.

## Reproduire cette démonstration

Les commandes ci-dessus s'exécutent à l'identique sur n'importe quelle copie de la base
portant le schéma actuel (`bun run db:migrate` appliqué). Repères utiles :

- Export signé d'une période : `GET /api/v1/admin/audit/export?from=…&to=…`
  (réservé au rôle `admin`, cf. `AuditController`).
- Vérification hors ligne, sans connexion base : `bun run audit:verify <export.json> --secret <clé>`
  (la clé est celle d'`AUDIT_EXPORT_SIGNING_SECRET`).
- Altération de contrôle avec l'utilisateur applicatif (doit toujours échouer) :
  `psql -U <DATABASE_USER> -d <DATABASE_NAME> -c "UPDATE audit_log SET …"`.
- Altération réelle avec l'utilisateur privilégié :
  `psql -U <DATABASE_ADMIN_USER> -d <DATABASE_NAME> -c "UPDATE …"` ou `"DELETE …"`.

Pour la démonstration en conditions réelles (copie de la base de revue, distincte de celle
présentée l'après-midi), seuls `DATABASE_ADMIN_USER`, `DATABASE_NAME` et l'hôte changent —
la séquence de commandes reste celle documentée ci-dessus, exécutable en moins de trois
minutes.

## Fichiers de ce dossier

| Fichier                                                         | Contenu                                                        |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| `scenario-1-modification/export-avant.json`, `verify-avant.txt` | Export signé et verdict, chaîne intacte                        |
| `scenario-1-modification/export-apres.json`, `verify-apres.txt` | Export signé et verdict, après modification d'un champ         |
| `scenario-2-suppression/export-avant.json`, `verify-avant.txt`  | Export signé et verdict, chaîne intacte (restaurée)            |
| `scenario-2-suppression/export-apres.json`, `verify-apres.txt`  | Export signé et verdict, après suppression d'un enregistrement |

Les fichiers `verify-*.txt` sont la sortie brute de `bun run audit:verify`, débarrassée
uniquement des codes couleur du terminal (la clé de signature y est masquée) — le texte du
verdict et des désignations d'enregistrement est inchangé.
