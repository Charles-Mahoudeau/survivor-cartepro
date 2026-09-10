# CartePro

Artéfact GitHub Actions pour démonstration.

## Comment lancer l'application

```shell
chmod +x start.sh && sh start.sh
# Vous devriez voir: `App ready on: https://cartepro.localhost`
# Ouvrez https://cartepro.localhost dans votre navigateur préféré.
```

L'application est servie en HTTPS par Traefik, avec un certificat auto-signé
généré à la construction de l'artéfact (un par build, jamais commité). Le
port 80 reste ouvert et redirige automatiquement vers le port 443. Le
navigateur affichera un avertissement de certificat non reconnu au premier
accès — c'est attendu pour un certificat auto-signé local, acceptez-le pour
continuer.
