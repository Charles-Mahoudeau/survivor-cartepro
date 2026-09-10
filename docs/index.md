# Documentation

Ce dossier rassemble la documentation du projet CartePro qui vit à côté du
code plutôt que dans un README d'application : les spécifications de design,
les références techniques, et les documents destinés à un lecteur non
développeur (guide d'utilisation, note d'intégrité du journal d'audit).

Le point de départ pour installer et lancer le projet reste le
[README racine](../README.md). Le contrat de l'API, lui, se lit en direct sur
`/docs` une fois l'API démarrée — voir
[technical/api.md](technical/api.md).

## Sommaire

| Document                                           | Contenu                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------ |
| [guide-utilisation.md](guide-utilisation.md)       | Parcours complet du prototype, écran par écran, pour une démonstration.  |
| [audit-integrity-note.md](audit-integrity-note.md) | Mécanisme d'intégrité du journal d'audit (chaînage par hash).            |
| [design/](design/index.md)                         | Spécifications d'implémentation (authentification, frontend).            |
| [technical/](technical/index.md)                   | Installation, spécification de base de l'API, schéma de base de données. |
