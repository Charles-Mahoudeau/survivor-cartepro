# Ticket Tout, guide d'utilisation du prototype

Ministère du Job et Bonheur, Direction Numérique et Innovation
Référence du cahier des charges : JEB/DNI/2026-002, version 1.1
Document établi le 3 septembre 2026

## 1. Objet de ce document

Ce guide décrit le parcours complet d'utilisation du prototype Ticket Tout, écran
par écran, dans l'ordre où ils se présentent. Il s'adresse à toute personne
appelée à manipuler l'application devant un tiers, sans l'avoir préparée.

Chaque étape indique trois choses : ce qui s'affiche, ce que vous faites, et ce
qui se produit ensuite. Vous pouvez suivre le document de bout en bout, ou entrer
directement dans l'un des trois parcours décrits aux sections 4, 5 et 6.

Le prototype fonctionne avec des données de démonstration. Aucune somme réelle
n'est détenue, transférée ni encaissée. Un bandeau permanent le rappelle en haut
de chaque écran, conformément à l'exigence formulée par le cabinet juridique le
1er septembre 2026.

## 2. Lancement de l'application

Depuis la racine du dépôt, deux commandes suffisent.

1. Installer les dépendances : `bun install`
2. Démarrer l'interface seule : `bun --filter @tickettout/frontend dev`

L'application répond alors sur `http://localhost:3000`.

Pour démarrer l'ensemble de la plateforme, base de données et interface
comprises, la commande est `bun run dev` depuis la racine. Elle démarre
PostgreSQL, l'API sur le port 3001 et l'interface sur le port 3000.

## 3. Les comptes de démonstration

L'écran de connexion propose trois raccourcis, un par profil. Ils ouvrent
directement l'espace correspondant, sans mot de passe à saisir.

| Profil         | Identité affichée | Adresse électronique           |
| -------------- | ----------------- | ------------------------------ |
| Salariée       | Marie Dupont      | marie.dupont@entreprise.fr     |
| Partenaire     | KostumParty       | contact@kostumparty.fr         |
| Administration | Jean Leclerc      | jean.leclerc@ministere.gouv.fr |

Le champ d'adresse et le champ de mot de passe restent utilisables. Ils
acceptent n'importe quelle saisie et ouvrent l'espace salarié, ce qui permet de
montrer le formulaire sans dépendre des raccourcis.

## 4. Parcours de la salariée

Objectif de ce parcours : montrer qu'une salariée consulte son solde, produit un
code de paiement, retrouve ses mouvements et cherche un partenaire.

### Étape 1. L'écran de connexion

Vous voyez le bloc marque de la République en haut à gauche, le bandeau de
simulation en ambre juste en dessous, puis le formulaire de connexion et les
trois raccourcis de démonstration.

Vous cliquez sur le raccourci « Salarié·e ».

L'application ouvre l'espace salarié sur l'écran du portefeuille.

### Étape 2. Le portefeuille

Vous voyez une carte bordée d'un filet tricolore, portant la phrase « À dépenser
chez vos partenaires préférés » et le solde en grands caractères, soit 126,10 €.
Sous la carte, deux actions : « Générer un code » et « Partenaires ». Plus bas,
les quatre derniers mouvements du compte, puis une note qui rappelle que
l'employeur crédite le portefeuille au début de chaque période.

Vous n'avez rien à faire sur cet écran, sinon le commenter.

C'est l'écran d'entrée de la salariée. Le solde y est formulé de façon positive,
comme le demande le cahier des charges dans sa version 1.1.

### Étape 3. La génération du code de paiement

Vous cliquez sur « Générer un code », ou sur « Payer » dans la barre latérale.

Vous voyez un compte à rebours, une barre de progression, un QR code, et sous le
QR code un code court de huit caractères destiné à la saisie manuelle. Le rappel
du solde figure en bas de l'écran, avec la mention « Le montant est saisi par le
partenaire ».

Le code reste valable trente minutes. Le compte à rebours passe au rouge dans la
dernière minute. À l'expiration, un voile couvre le QR code et un bouton propose
d'en générer un nouveau.

Ce code est à usage unique. C'est le partenaire qui saisit le montant, jamais la
salariée.

### Étape 4. L'historique

Vous cliquez sur « Historique » dans la barre latérale.

Vous voyez les mouvements des trente derniers jours, regroupés par journée. Les
crédits apparaissent en vert avec une flèche descendante, les paiements en bleu
avec une flèche montante. Chaque ligne porte le nom du partenaire, l'heure et le
montant.

Un bouton « Charger plus » figure en bas de la liste.

### Étape 5. Le catalogue des partenaires

Vous cliquez sur « Partenaires » dans la barre latérale.

Vous voyez un champ de recherche, une rangée de catégories cliquables, puis la
liste des établissements référencés. Trois partenaires sont actifs à ce jour :
Poney Dream 78 à Rambouillet, KostumParty à Paris 11e, et Glaces Artisanales
Corrèze à Brive-la-Gaillarde.

Vous saisissez « poney » dans le champ de recherche, ou vous cliquez sur une
catégorie.

La liste se filtre immédiatement. Si aucun établissement ne correspond, un
message le dit explicitement à la place d'une liste vide.

### Étape 6. La déconnexion

Vous cliquez sur « Se déconnecter » en bas de la barre latérale.

L'application revient à l'écran de connexion.

## 5. Parcours du partenaire

Objectif de ce parcours : montrer qu'un commerçant suit son activité et consulte
le dossier qu'il a déposé auprès du Ministère.

### Étape 7. L'entrée dans l'espace partenaire

Depuis l'écran de connexion, vous cliquez sur le raccourci « Partenaire ».

L'application ouvre le tableau de bord de KostumParty.

### Étape 8. Le tableau de bord

Vous voyez, en en-tête, le nom de l'établissement, le badge « Partenaire Officiel
du Ministère » et la pastille de statut « Actif ». En dessous, trois indicateurs :
le nombre d'encaissements du jour, le volume du jour et le volume du mois. Puis
la liste des encaissements récents, chacun portant son mode, par QR code ou par
saisie manuelle, sa date et son montant.

Aucune identité de salarié n'apparaît sur cet écran, ni nom, ni matricule. C'est
une contrainte de minimisation des données, pas un oubli d'affichage.

### Étape 9. Le dossier du partenaire

Vous cliquez sur « Mon dossier » dans la barre latérale, ou sur le lien
« Consulter mon dossier » en bas du tableau de bord.

Vous voyez deux fiches côte à côte. La première porte l'identité de l'entreprise :
raison sociale, numéro SIREN, objet social et catégorie. La seconde porte les
coordonnées et la date de dépôt, avec le rappel que le SIREN et le statut ne sont
pas modifiables.

Plus bas figure l'historique des décisions. Chaque entrée montre la transition,
de « En attente » vers « Actif » dans le cas présent, le motif écrit par l'agent,
son nom et la date de la décision.

C'est cet écran qui matérialise l'exigence du cabinet juridique : un partenaire,
accepté comme refusé, voit le motif intégral de la décision qui le concerne.

## 6. Parcours de l'administration

Objectif de ce parcours : montrer qu'un agent instruit un dossier et que sa
décision produit un effet immédiat et tracé.

### Étape 10. L'entrée dans l'espace d'administration

Depuis l'écran de connexion, vous cliquez sur le raccourci « Administration ».

L'application ouvre la file des dossiers partenaires.

### Étape 11. La file d'instruction

Vous voyez quatre compteurs en haut de l'écran : deux dossiers en attente, trois
dossiers actifs, un dossier refusé, six dossiers au total. En dessous, une rangée
d'onglets de statut, positionnée par défaut sur « En attente », puis la liste des
dossiers correspondants.

Chaque ligne porte l'initiale de l'établissement, sa raison sociale, son numéro
SIREN, sa ville, sa catégorie, sa pastille de statut et son ancienneté.

Vous cliquez sur le dossier « Chapelier Fontaine ».

### Étape 12. L'instruction d'un dossier

Vous voyez le dossier complet à gauche : raison sociale, SIREN, objet social,
catégorie, adresse et date de dépôt. À droite, le panneau de décision.

Vous cliquez sur « Accepter ». Le bouton se colore en vert.

Vous saisissez un motif dans le champ prévu, par exemple : « SIREN vérifié auprès
de l'INSEE. Activité de chapellerie conforme à la catégorie Mode et Artisanat.
Partenaire retenu. »

Le motif est obligatoire. Tant que le champ reste vide, le bouton
« Enregistrer la décision » demeure inactif. Un refus dont le motif n'est pas
enregistré ne serait pas opposable.

Vous cliquez sur « Enregistrer la décision ».

L'application revient à la file d'instruction. Les compteurs se mettent à jour :
un dossier en attente, quatre dossiers actifs. Le Chapelier Fontaine a quitté
l'onglet « En attente » et rejoint l'onglet « Actifs ». Il apparaît désormais
dans le catalogue consulté par les salariés.

### Étape 13. La vérification du refus motivé

Vous cliquez sur l'onglet « Refusés », puis sur le dossier
« Tabac Presse de la Mairie ».

Vous voyez l'historique de décision, avec le motif écrit lors du refus : la vente
de tabac et les jeux de hasard sont exclus des catégories éligibles. Le panneau
de décision n'est pas proposé, puisque le dossier n'est plus en attente.

C'est la démonstration du refus motivé et de la trace qu'il laisse, telle que le
cabinet juridique l'a demandée.

## 7. La mention de simulation

Le bandeau ambre en haut de chaque écran porte la phrase suivante :

> Simulation. Tous les montants affichés dans cette application sont fictifs.
> Aucune somme réelle n'est détenue, transférée ni encaissée.

Il est présent sur l'écran de connexion et dans les trois espaces. Le titre de
l'onglet du navigateur porte lui aussi la mention, sous la forme
« Ticket Tout (simulation) ».

Ce bandeau remplace la mention entre parenthèses qui accompagnait auparavant
chaque montant. Le choix est assumé : la mention reste visible en permanence et
non dissimulée, tout en laissant les chiffres lisibles. Il appartient au cabinet
juridique de confirmer que cette présentation le satisfait.

## 8. Ce que le prototype ne fait pas encore

Cette section existe pour éviter toute mauvaise surprise pendant une
démonstration publique.

1. L'encaissement par le partenaire n'est pas encore relié à une saisie de
   montant. Le tableau de bord affiche des encaissements passés, mais l'écran de
   validation reste à construire.
2. Le scan du QR code par la caméra du partenaire n'est pas implémenté. Le code
   court de saisie manuelle est la voie prévue en premier.
3. L'inscription d'un nouveau partenaire depuis l'espace public n'est pas encore
   ouverte. Les dossiers présents ont été saisis dans les données de départ.
4. La gestion des comptes, les abondements employeurs et le tableau de bord
   national restent à construire dans l'espace d'administration.
5. Les données ne sont pas encore persistées. Une décision d'instruction est
   visible immédiatement, mais elle disparaît au rechargement de la page.

## 9. Conduite à tenir en cas de problème

1. Si l'application ne répond pas sur le port 3000, vérifiez qu'aucun autre
   serveur ne l'occupe déjà, puis relancez la commande de démarrage.
2. Si un écran reste blanc, rechargez la page. L'application n'a pas d'état
   serveur, un rechargement la ramène à l'écran de connexion.
3. Si une décision d'instruction semble ne pas avoir été prise en compte,
   vérifiez que le motif avait bien été saisi. Le bouton reste inactif sans lui.
4. Si le compte à rebours du code de paiement est arrivé à zéro, cliquez sur
   « Générer un nouveau code ». Le code précédent devient alors inutilisable.
5. Si une question porte sur un écran absent, renvoyez à la section 8. Elle liste
   ce qui n'est pas encore fait, dans l'ordre où nous prévoyons de le livrer.
