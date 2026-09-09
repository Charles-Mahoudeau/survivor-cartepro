# Tests de charge Locust

Trois scénarios Locust indépendants, un par espace du dispositif :

| Fichier                  | Persona                  | Comportement simulé                                                                      |
| ------------------------ | ------------------------ | ---------------------------------------------------------------------------------------- |
| `employee_locustfile.py` | Salarié (`employee`)     | Consulte son portefeuille, parcourt le catalogue partenaires, initie/annule un paiement  |
| `admin_locustfile.py`    | Administration (`admin`) | Surveille employeurs/abondements/dossiers, décide occasionnellement, exporte des données |
| `partner_locustfile.py`  | Partenaire (`partner`)   | Consulte sa fiche, son dossier, encaisse des paiements au comptoir                       |

Ce dossier vit à la racine du monorepo plutôt que sous `apps/backend` : Locust
est un outil Python qui teste l'API HTTP déployée de l'extérieur, orthogonal
aux workspaces Bun/Turbo (`apps/*`, `packages/*`) — au même titre que `docs/`.

## Pré-requis

1. Le backend tourne et est joignable (par défaut `http://localhost:3001`) :
   ```bash
   bun run dev
   ```
2. La base est chargée avec le jeu de données de recette (comptes de démo,
   mot de passe partagé) :
   ```bash
   cd apps/backend
   bun run db:seed --reset
   ```
3. Python ≥ 3.10, puis les dépendances de ce dossier :
   ```bash
   python3 -m venv .venv && source .venv/bin/activate
   pip install -r tests/locust/requirements.txt
   ```

## Lancer un scénario

Interface web (par défaut sur http://localhost:8089) :

```bash
locust -f tests/locust/employee_locustfile.py --host http://localhost:3001
locust -f tests/locust/admin_locustfile.py    --host http://localhost:3001
locust -f tests/locust/partner_locustfile.py  --host http://localhost:3001
```

Mode headless, par exemple 5 utilisateurs simulés pendant 3 minutes :

```bash
locust -f tests/locust/employee_locustfile.py --host http://localhost:3001 \
  --headless --users 5 --spawn-rate 0.2 --run-time 3m
```

## ⚠️ La limite de tentatives de connexion est PARTAGÉE par IP

`auth.constants.ts` (`SIGN_IN_RATE_LIMIT`) autorise **5 connexions par
minute, par adresse IP source, tous comptes confondus** — pas 5 par compte.
Depuis une seule machine, employé, admin et partenaire vident le même
compteur. Chaque utilisateur Locust ne se connecte qu'une fois (dans
`on_start`), donc ce n'est un problème qu'au **démarrage** (spawn) du test,
pas en régime établi.

Conséquences pratiques :

- **`--spawn-rate` bas** : viser ≤ 0,2 utilisateur/s (soit 1 connexion toutes
  les 5 s) pour rester sous le seuil pendant la montée en charge. Les
  exemples ci-dessus utilisent déjà `0.2`.
- Si un `429` survient quand même pendant le spawn, le login intégré
  (`common.sign_in`) **réessaie automatiquement** avec un backoff — l'utilisateur
  simulé attend puis repart, il n'échoue pas la course.
- Ne pas lancer les trois fichiers **en même temps** contre le même serveur
  sans en tenir compte : ils partagent le même compteur d'IP.
- `partner_locustfile.py` ajoute une connexion compagnon (un seul compte
  salarié, partagé par tous les partenaires simulés — voir plus bas) : elle
  compte aussi dans le budget des 5/min.

## ⚠️ `admin_locustfile.py` écrit des données

Trois tâches sont volontairement des écritures réelles :

- `create_employer` — crée un employeur à chaque appel.
- `create_and_apply_allocation` — crée **et applique** un abondement, donc
  crédite réellement les portefeuilles actifs de l'employeur choisi.
- `decide_pending_application` — approuve ou refuse un dossier partenaire en
  attente.

À ne lancer que contre une base jetable/locale. Pour repartir d'un état
propre :

```bash
cd apps/backend
bun run db:seed --reset
```

## Comptes utilisés

Chaque fichier lit un pool de comptes dans `tests/locust/data/*.csv`
(colonnes `email,password` — un mot de passe vide retombe sur le mot de passe
partagé de la recette, `TicketTout2026!`, cf. `scripts/seed/dataset.ts`).

| Fichier              | Comptes fournis par défaut                                                    |
| -------------------- | ----------------------------------------------------------------------------- |
| `data/admins.csv`    | Les 2 administrateurs de démo (`jean.leclerc@…`, `jean-eudes.berlier@…`)      |
| `data/employees.csv` | Le seul salarié à adresse déterministe (`marie.dupont@entreprise.fr`)         |
| `data/partners.csv`  | Les 9 partenaires **ACTIFS** du jeu de recette (statut requis pour encaisser) |

`employees.csv` n'a qu'une ligne parce que les 49 autres salariés seedés ont
une adresse tirée par un générateur aléatoire — seule cette première est
prévisible. Pour étaler la charge sur plus de comptes, interroger la base
seedée et ajouter des lignes :

```sql
SELECT email FROM "user" WHERE role = 'employee' ORDER BY random() LIMIT 20;
```

Un chemin de fichier alternatif peut être passé sans toucher au dépôt, via
variable d'environnement :

```bash
LOCUST_EMPLOYEE_ACCOUNTS=/chemin/vers/mes-employes.csv \
  locust -f tests/locust/employee_locustfile.py --host http://localhost:3001
```

(`LOCUST_ADMIN_ACCOUNTS`, `LOCUST_PARTNER_ACCOUNTS` pour les deux autres.)

## Le flux d'encaissement du fichier partenaire

Encaisser un paiement (`POST /api/v1/payments`) exige un jeton de paiement
**vivant**, émis par un salarié. `partner_locustfile.py` connecte donc, en
plus de chaque partenaire simulé, **un seul** compte salarié compagnon
(`tests/locust/data/employees.csv`, première ligne) via une session HTTP à
part — hors des statistiques Locust du partenaire, puisqu'il s'agit de
préparer l'état du test, pas du comportement mesuré. Ce compte mutualisé
émet un jeton à la demande pour chaque tentative d'encaissement.

Une réponse `400` (solde insuffisant) sur `POST /api/v1/payments` est traitée
comme un résultat normal, pas comme un échec de test : le portefeuille
compagnon est partagé et fini, l'épuiser sous charge est attendu.

## Variables d'environnement

| Variable                   | Défaut                            | Effet                                                                         |
| -------------------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| `LOCUST_APP_ORIGIN`        | `http://localhost:3000`           | En-tête `Origin` envoyé au sign-in (doit figurer dans `AUTH_TRUSTED_ORIGINS`) |
| `LOCUST_SEED_PASSWORD`     | `TicketTout2026!`                 | Mot de passe par défaut pour toute ligne CSV sans mot de passe                |
| `LOCUST_EMPLOYEE_ACCOUNTS` | `tests/locust/data/employees.csv` | Pool de comptes salariés                                                      |
| `LOCUST_ADMIN_ACCOUNTS`    | `tests/locust/data/admins.csv`    | Pool de comptes administration                                                |
| `LOCUST_PARTNER_ACCOUNTS`  | `tests/locust/data/partners.csv`  | Pool de comptes partenaires                                                   |
