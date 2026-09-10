# Technical

Ce dossier contient les références techniques du projet : comment installer
et démarrer CartePro, comment appeler son API, et à quoi ressemble son schéma
de base de données.

## Sommaire

| Document                         | Contenu                                                                                                                             |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| [install.md](install.md)         | Installer et lancer CartePro sans cloner le dépôt, depuis l'artéfact CI.                                                            |
| [deployment.md](deployment.md)   | Déployer CartePro en production : option managée (Coolify) ou Docker brut avec reverse proxy manuel.                                |
| [api.md](api.md)                 | Spécification de base de l'API : racine, authentification, erreurs, ressources. Le contrat complet est servi en direct sur `/docs`. |
| [db-schema.dbml](db-schema.dbml) | Schéma de base de données, introspecté sur une base fraîchement migrée et seedée.                                                   |

Pour démarrer le projet en développement depuis les sources plutôt que depuis
l'artéfact, voir le [README racine](../../README.md#démarrer).
