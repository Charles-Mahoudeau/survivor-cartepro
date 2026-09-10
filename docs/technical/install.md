# Installation et lancement

Ce document décrit comment installer et démarrer CartePro **sans cloner le
dépôt ni installer de toolchain de développement**, à partir de l'artéfact
produit automatiquement par la CI. Pour lancer le projet en développement
depuis les sources, voir plutôt le [README racine](../../README.md).

## 1. Prérequis

| Élément                     | Détail                                                                      |
| --------------------------- | --------------------------------------------------------------------------- |
| Docker Engine               | Avec le plugin `docker compose` (`docker compose version`)                  |
| Port `80` libre             | Le reverse proxy (Traefik) y écoute ; aucune autre appli ne doit l'utiliser |
| Résolution de `*.localhost` | Fonctionne nativement sur la plupart des OS récents (voir §5 sinon)         |

Aucune autre dépendance : les images de l'application sont déjà construites,
il n'y a ni Bun, ni Node, ni base de données à installer soi-même.

## 2. Récupérer l'artéfact

Chaque push sur `main` déclenche le workflow **Build and Package Artifact**
(`.github/workflows/build.yml`), qui construit les images Docker du backend
et du frontend et publie un artéfact GitHub Actions nommé `cartepro-livrable`.

1. Ouvrir l'onglet **Actions** du dépôt GitHub.
2. Sélectionner le workflow **Build and Package Artifact**.
3. Ouvrir l'exécution correspondant au commit voulu (la plus récente sur
   `main`, en général).
4. Dans la section **Artifacts** en bas de la page, télécharger
   **cartepro-livrable** (fichier `.zip`).

L'artéfact est conservé 14 jours après sa génération, au-delà il faut
redéclencher le workflow (un nouveau push sur `main` suffit).

5. Décompresser le zip. Il contient :

   | Fichier                | Contenu                                                                       |
   | ---------------------- | ----------------------------------------------------------------------------- |
   | `docker-images.tar.gz` | Les images `cartepro-backend` et `cartepro-frontend`, déjà construites        |
   | `docker-compose.yaml`  | La stack complète : Traefik, backend, frontend, PostgreSQL 18                 |
   | `.env`                 | La configuration de la stack, secrets de signature déjà générés pour ce build |
   | `start.sh`             | Le script qui charge les images et démarre la stack                           |

Le workflow génère `.env` à partir de `.env.example` et tire, pour chaque
build, un secret aléatoire propre pour `BETTER_AUTH_SECRET`,
`PAYMENT_TOKEN_SIGNING_SECRET` et `AUDIT_EXPORT_SIGNING_SECRET` : deux
artéfacts téléchargés séparément n'ont jamais les mêmes secrets.

## 3. Lancer l'application

Depuis le dossier décompressé :

```bash
chmod +x start.sh && sh start.sh
```

Le script charge les deux images Docker (`docker load`) puis démarre la
stack (`docker compose up -d`) — `.env` porte déjà tout ce dont l'API a
besoin pour démarrer, aucune configuration supplémentaire n'est nécessaire.

Vous devez voir en dernière ligne :

```
App ready on: http://cartepro.localhost
```

Ouvrez ensuite `http://cartepro.localhost` dans votre navigateur.

## 4. Se connecter

L'application démarre avec des données de démonstration et trois comptes
prêts à l'emploi (salarié, partenaire, administration), accessibles depuis
des raccourcis sur l'écran de connexion. Le parcours complet, écran par
écran, est décrit dans [docs/guide-utilisation.md](../guide-utilisation.md).

## 5. `cartepro.localhost` ne répond pas

Le domaine `.localhost` pointe vers `127.0.0.1` nativement sur la plupart des
systèmes et navigateurs récents. Si ce n'est pas le cas sur votre poste,
ajoutez la ligne suivante à votre fichier hosts (`/etc/hosts` sous
Linux/macOS, `C:\Windows\System32\drivers\etc\hosts` sous Windows) :

```
127.0.0.1 cartepro.localhost
```

Si le port `80` est déjà occupé par un autre service, `docker compose up -d`
échoue au démarrage du conteneur `traefik` : libérez le port ou arrêtez le
service qui le retient avant de relancer `start.sh`.

## 6. Arrêter, relancer, mettre à jour

Toutes les commandes suivantes s'exécutent depuis le dossier décompressé.

| Commande                         | Effet                                                          |
| -------------------------------- | -------------------------------------------------------------- |
| `docker compose down`            | Arrête la stack, conserve les données (volume `postgres-data`) |
| `docker compose down -v`         | Arrête la stack et **supprime** les données                    |
| `docker compose logs -f backend` | Suit les logs de l'API                                         |
| `sh start.sh`                    | Recharge les images et relance la stack, sans toucher à `.env` |

Chaque nouvel artéfact embarque ses propres secrets, générés au moment de son
build : télécharger un nouveau zip et lancer `start.sh` dedans invalide les
sessions ouvertes et les jetons émis par l'ancien. Pour l'éviter en changeant
d'artéfact tout en gardant les mêmes données (volume `postgres-data` inchangé
entre deux dossiers, le nom de projet Compose étant fixe), copiez l'ancien
`.env` dans le nouveau dossier avant de lancer `start.sh`.
