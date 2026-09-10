# Design

Ce dossier contient les spécifications d'implémentation du projet : les
décisions d'architecture prises avant (ou pendant) l'écriture du code, avec
leurs sources et leur périmètre explicites.

## Sommaire

| Document                                                 | Contenu                                                                                          |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [authentication.md](authentication.md)                   | Authentification backend : inscription, connexion, rôles, garde de session, limitation de débit. |
| [frontend.md](frontend.md)                               | Spécification frontend. Sections DSFR / identité de l'État caduques depuis le 7 septembre 2026.  |
| [frontend-architecture.md](frontend-architecture.md)     | Client API typé et tableau de bord salarié, côté frontend.                                       |
| [frontend-authentication.md](frontend-authentication.md) | Authentification côté frontend, dérivée de `authentication.md` et de `frontend.md`.              |
