# Déploiement en production

Ce document décrit comment mettre CartePro en production, sur un serveur que
vous administrez. Il ne s'agit pas du même besoin que
[install.md](install.md) : ce dernier lance une démonstration locale à partir
de l'artéfact CI (`cartepro.localhost`, certificat auto-signé) ; ici, il
s'agit d'exposer l'application sur un vrai nom de domaine, avec un certificat
HTTPS valide et des secrets propres à ce déploiement.

Le projet expose deux chemins, décrits dans les deux sections suivantes :

| Option                | Principe                                                                                       | Pour qui                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Managée (Coolify)** | Un panel self-hosted construit `docker-compose.yaml` à votre place et gère HTTPS seul.         | On veut déployer vite, sans écrire de reverse proxy soi-même.  |
| **Docker brut**       | `docker compose` directement sur le serveur, reverse proxy et certificat configurés à la main. | On veut le contrôle complet, sans dépendance à un outil tiers. |

Les deux options partent du **même** `docker-compose.yaml` à la racine du
dépôt (celui qui construit les images depuis les sources — pas celui de
`artifact/`, qui sert uniquement à l'artéfact CI de démonstration).

## 1. Prérequis communs

Quelle que soit l'option choisie :

| Élément                                   | Détail                                                                                                                                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Un nom de domaine                         | Avec un enregistrement DNS de type `A` pointant vers l'IP du serveur.                                                                                                                               |
| Un serveur avec Docker Engine             | Le plugin `docker compose` inclus (`docker compose version`). 2 vCPU / 4 Go de RAM sont un point de départ raisonnable — la construction des images (Next.js + NestJS) est ce qui consomme le plus. |
| Trois secrets générés pour CE déploiement | Voir le tableau ci-dessous. Jamais la valeur d'exemple de `.env.example`, jamais réutilisés entre deux déploiements.                                                                                |

```bash
openssl rand -base64 32   # à relancer une fois par secret
```

| Variable                       | Rôle                                                                                                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `BETTER_AUTH_SECRET`           | Signe les cookies de session. Une rotation invalide toutes les sessions ouvertes.                                                                                                                            |
| `PAYMENT_TOKEN_SIGNING_SECRET` | Signe les jetons QR de paiement (durée de vie maximale : 5 minutes, imposée côté serveur).                                                                                                                   |
| `AUDIT_EXPORT_SIGNING_SECRET`  | Signe l'export JSON du journal d'audit — voir [audit-integrity-note.md](../audit-integrity-note.md). À conserver **hors** de la sauvegarde de la base : c'est ce qui permet de vérifier un export sans elle. |

`NODE_ENV=production` est également obligatoire : Better Auth ne le lit
qu'une fois, au chargement du module, et cette lecture décide si le
rate-limiting est actif et si les cookies sont `Secure`. `DATABASE_LOGGING`
doit rester à `false` — les deux sont déjà les valeurs par défaut du
`docker-compose.yaml` racine, mais restent à vérifier si vous partez d'un
`.env` copié depuis un environnement de développement.

Les migrations en attente s'appliquent automatiquement au démarrage du
conteneur backend, sur une connexion de courte durée avec le rôle privilégié
(`DATABASE_ADMIN_USER`) ; l'application elle-même se connecte ensuite avec un
rôle restreint (`DATABASE_USER`), provisionné automatiquement au premier
démarrage. Aucune étape manuelle de migration n'est nécessaire.

## 2. Option A — Managée avec Coolify

[Coolify](https://coolify.io) est un panel self-hosted qui déploie un projet
Git en construisant son `docker-compose.yaml`, puis place automatiquement son
propre reverse proxy (Traefik) devant chaque service auquel vous assignez un
domaine, avec un certificat Let's Encrypt renouvelé sans intervention. C'est
ce qui rend cette option « automatique » : il n'y a ni Traefik, ni ACME, ni
certificat à configurer soi-même.

Ceci suppose qu'une instance Coolify tourne déjà quelque part (sur ce même
serveur ou un autre) — son installation n'est pas couverte ici, voir la
documentation officielle de Coolify.

### 2.1 Étapes

1. **Nouvelle ressource → Docker Compose**, en pointant sur ce dépôt et la
   branche à déployer. Coolify lit le `docker-compose.yaml` de la racine.
2. Coolify détecte les trois services (`frontend`, `backend`, `postgres`) et
   analyse les `${VARIABLE}` qu'ils référencent : il présente un formulaire
   pour chacune, y compris les remplacer par le contenu de `.env.example` en
   important le fichier. Renseigner en particulier les trois secrets générés
   à l'étape 1, et :
   - `NODE_ENV=production`
   - `DATABASE_LOGGING=false`
   - `BETTER_AUTH_URL` — l'URL publique du backend (voir §2.2)
   - `APP_ORIGIN` — l'URL publique du frontend
   - `AUTH_TRUSTED_ORIGINS` — la même valeur que `APP_ORIGIN`
   - `BACKEND_INTERNAL_URL` — laisser la valeur par défaut
     (`http://backend:3000`) : les services d'un même déploiement Compose se
     joignent par leur nom, Coolify ne change rien à ça.
3. Sur le service `frontend`, assigner le domaine public
   (`cartepro.example.com`). Sur le service `backend`, assigner un
   sous-domaine dédié (`api.cartepro.example.com`). Coolify configure le
   routage et délivre un certificat Let's Encrypt pour chacun des deux,
   automatiquement.
4. Déployer. Coolify construit les deux images depuis les sources (comme le
   fait la CI), démarre `postgres`, attend son healthcheck, puis démarre
   `backend` et `frontend`.

### 2.2 Un domaine par service, pas de découpage par chemin

Contrairement à l'artéfact de démonstration ([install.md](install.md)), qui
sert le frontend et le backend derrière **un seul** nom d'hôte en distinguant
par préfixe de chemin (`/api`, `/docs`, `/health`, `/auth`), l'option Coolify
donne ici **un sous-domaine à chaque service** — c'est la façon dont son
assignation de domaine par service fonctionne nativement, sans label Traefik
à écrire à la main. En conséquence :

- `APP_ORIGIN` = `https://cartepro.example.com`
- `BETTER_AUTH_URL` = `https://api.cartepro.example.com`
- `AUTH_TRUSTED_ORIGINS` = `https://cartepro.example.com`

Si `AUTH_TRUSTED_ORIGINS` ne contient pas l'origine exacte du frontend,
chaque écriture authentifiée échoue avec un 403 — c'est la cause la plus
fréquente d'un déploiement Coolify qui répond mais refuse toute connexion.

### 2.3 Redéploiement automatique

Coolify peut s'abonner aux push sur la branche choisie (via une App GitHub ou
une clé de déploiement) et redéclencher un build à chaque push — c'est
l'équivalent applicatif du workflow CI `build.yml`, mais qui déploie au lieu
de produire un artéfact téléchargeable.

### 2.4 Ce que Coolify ne fait pas automatiquement

La base `postgres` de ce `docker-compose.yaml` est un service Compose ordinaire,
pas une ressource « base de données managée » Coolify — elle n'hérite donc pas
des sauvegardes planifiées que Coolify propose pour ses propres ressources de
base de données. Voir §4 pour la stratégie de sauvegarde, valable ici comme
pour l'option Docker brut.

## 3. Option B — Docker brut, sans panel

Cette option n'ajoute aucun outil : `docker compose`, un reverse proxy
Traefik configuré à la main, un certificat Let's Encrypt obtenu par le
challenge HTTP de Traefik lui-même.

### 3.1 Provisionner le serveur

```bash
# Docker Engine + le plugin compose, selon la distribution du serveur —
# voir la documentation officielle de Docker pour la commande exacte.
git clone <url-du-dépôt> cartepro
cd cartepro
cp .env.example .env
```

Éditer `.env` : les trois secrets (§1), `NODE_ENV=production`,
`DATABASE_LOGGING=false`, et les variables d'origine (§3.3, une fois le
domaine choisi).

### 3.2 Le piège : `compose.override.yaml`

Le dépôt porte à sa racine un `compose.override.yaml`, utilisé en
développement pour publier les ports du frontend, du backend et de
PostgreSQL sur l'hôte (`3000`, `3001`, `5432`). Docker Compose le fusionne
**automatiquement** avec `docker-compose.yaml` dès qu'aucun `-f` explicite
n'est passé — un `docker compose up -d --build` lancé tel quel sur ce
serveur republierait donc ces trois ports vers l'extérieur, PostgreSQL
compris.

La parade est de toujours nommer les fichiers explicitement, ce qui
désactive cette fusion implicite. C'est aussi ce qui permet d'ajouter le
reverse proxy sans modifier `docker-compose.yaml` lui-même (§3.3) :

```bash
docker compose -f docker-compose.yaml -f docker-compose.proxy.yaml up -d --build
```

### 3.3 Reverse proxy et HTTPS

Créer, à côté du dépôt cloné, `docker-compose.proxy.yaml` — il ajoute un
service Traefik et des labels de routage sur `frontend`/`backend`, sans
toucher au fichier suivi par git :

```yaml
services:
  traefik:
    image: traefik:v3.7
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik-certs:/certs
    command:
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --entrypoints.web.http.redirections.entrypoint.to=websecure
      - --entrypoints.web.http.redirections.entrypoint.scheme=https
      - --certificatesresolvers.letsencrypt.acme.httpchallenge=true
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
      - --certificatesresolvers.letsencrypt.acme.email=${LETSENCRYPT_EMAIL:?set LETSENCRYPT_EMAIL to an address that can receive Let's Encrypt expiry notices}
      - --certificatesresolvers.letsencrypt.acme.storage=/certs/acme.json

  frontend:
    labels:
      - traefik.enable=true
      - traefik.http.routers.front.rule=Host(`${APP_DOMAIN}`)
      - traefik.http.routers.front.entrypoints=websecure
      - traefik.http.routers.front.tls.certresolver=letsencrypt
      - traefik.http.routers.front.priority=1
      - traefik.http.services.front.loadbalancer.server.port=3000

  backend:
    labels:
      - traefik.enable=true
      - traefik.http.routers.back.rule=Host(`${APP_DOMAIN}`) && (PathPrefix(`/api`) || PathPrefix(`/docs`) || Path(`/health`) || PathPrefix(`/auth`))
      - traefik.http.routers.back.entrypoints=websecure
      - traefik.http.routers.back.tls.certresolver=letsencrypt
      - traefik.http.routers.back.priority=100
      - traefik.http.services.back.loadbalancer.server.port=3000

volumes:
  traefik-certs:
```

Ce routage par préfixe de chemin sur un seul nom d'hôte reproduit exactement
celui de l'artéfact de démonstration (`artifact/docker-compose.yaml`) — la
seule différence est le résolveur de certificat : ACME/HTTP-01 réel ici,
contre un certificat auto-signé généré une fois par la CI là-bas. La priorité
plus élevée du routeur `back` est nécessaire : sans elle, Traefik pourrait
faire correspondre `/api/...` à la règle plus générale du frontend en premier.

Ajouter à `.env` : `LETSENCRYPT_EMAIL` (une adresse qui reçoit les alertes
d'expiration Let's Encrypt) et `APP_DOMAIN` (le nom de domaine choisi), puis
dériver les variables applicatives de la même valeur :

```bash
APP_DOMAIN=cartepro.example.com
LETSENCRYPT_EMAIL=vous@example.com
APP_ORIGIN=https://cartepro.example.com
BETTER_AUTH_URL=https://cartepro.example.com
AUTH_TRUSTED_ORIGINS=https://cartepro.example.com
```

Le port `80` reste nécessaire même en HTTPS : c'est par lui que passe le défi
HTTP-01 de Let's Encrypt, avant sa redirection automatique vers `443`.

### 3.4 Démarrer

```bash
docker compose -f docker-compose.yaml -f docker-compose.proxy.yaml up -d --build
```

Traefik démarre, obtient un certificat pour `APP_DOMAIN` au premier accès,
`postgres` démarre et attend son healthcheck, puis `backend` et `frontend`
démarrent à leur tour. Vérifier `https://cartepro.example.com/health` répond
`{"status":"ok",...}` avant de considérer le déploiement terminé.

### 3.5 Arrêter, mettre à jour, revenir en arrière

Toutes les commandes suivantes s'exécutent depuis le dossier cloné, en
gardant les deux `-f` explicites du §3.2 :

| Commande                                                                                       | Effet                                                                                                            |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `docker compose -f docker-compose.yaml -f docker-compose.proxy.yaml down`                      | Arrête la stack, conserve les données (volume `postgres-data`).                                                  |
| `git pull && docker compose -f docker-compose.yaml -f docker-compose.proxy.yaml up -d --build` | Reconstruit les images depuis la nouvelle révision et redémarre.                                                 |
| `git checkout <ancien-tag>` puis la commande précédente                                        | Revient à une révision antérieure — les migrations ne redescendent pas automatiquement, voir la note ci-dessous. |

Une mise à jour applique les migrations en attente au redémarrage du backend
(§1) ; il n'existe pas de retour arrière automatique d'une migration déjà
appliquée. Revenir à une révision plus ancienne du code sans revenir aussi
sur le schéma de base peut donc faire tourner une ancienne version de
l'application contre un schéma plus récent qu'elle ne connaît pas.

## 4. Sauvegardes

Les deux options partagent le même volume Docker nommé `postgres-data` : il
n'est ni sauvegardé ni répliqué automatiquement par défaut, panel managé ou
non. Une sauvegarde régulière, par exemple via une tâche planifiée sur le
serveur :

```bash
docker compose exec -T postgres pg_dump -U "$DATABASE_ADMIN_USER" "$DATABASE_NAME" \
  | gzip > "cartepro-$(date +%F).sql.gz"
```

Le journal d'audit étant conçu pour être inaltérable une fois écrit (voir
[audit-integrity-note.md](../audit-integrity-note.md)), une restauration
depuis une sauvegarde antérieure à un incident constitue elle-même un
changement d'état à tracer et à justifier — jamais une opération anodine.

## 5. Sécurité — points à vérifier avant la mise en ligne

- Les trois secrets (§1) sont propres à ce déploiement, générés après le
  clone, jamais ceux d'un `.env` de développement.
- Aucun port applicatif (`3000`, `3001`, `5432`) n'est publié directement sur
  l'hôte — seuls `80` et `443` (le reverse proxy) le sont. Le
  `docker-compose.yaml` racine ne publie déjà rien par lui-même (`expose`,
  pas `ports`) ; c'est `compose.override.yaml` (§3.2) qu'il faut exclure.
  Coolify ne monte pas ce fichier, cette étape ne concerne que l'option
  Docker brut.
- `AUTH_TRUSTED_ORIGINS` contient l'origine exacte servie au navigateur
  (schéma + domaine), pas une valeur de développement oubliée.
- L'accès SSH au serveur est la seule porte d'administration restante —
  clé uniquement, mot de passe désactivé.
