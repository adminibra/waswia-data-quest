# WASWIA Compass

Reproduire fidèlement l'application WASWIA (collecte de données terrain & back-office) à partir des 8 captures d'écran fournies.

L'application comprend deux espaces principaux :
1. L'application mobile/terrain (client) :
   - Écran de connexion (/auth) avec logo WASWIA, fond violet sombre (#280f3e), carte blanche de login (email, mot de passe avec toggle vue, bouton dégradé violet-cyan 'Se connecter', lien inscription, texte 'Application de collecte de données terrain').
   - Accueil terrain (0.PNG et 01.PNG) : bandeau supérieur dégradé violet-cyan avec logo WASWIA, badge 'En ligne' (indicateur wifi) et bouton déconnexion. Salutation 'Bonjour 👋', email utilisateur, badge 'Admin' cyan. Bloc 'Synchronisation' avec état des réponses en attente, dernière sync et bouton 'Synchroniser'. 3 compteurs (Sondages: 3, Terminés: 649, En attente: 0). Carte d'accès 'Back-Office' ('Gérer les sondages et enquêteurs' avec flèche). Section 'Mes sondages' avec cartes cliquables pour remplir ou consulter les questionnaires ('Village des Jeux des Îles de l'Océan Indien 2027', 'Entreprise/Institution/ONG', 'PARTICULIER').

2. Le Back-Office d'administration (avec sidebar latérale rétractable/responsive) :
   - Navigation : Logo WASWIA, onglets Dashboard, Sondages, Enquêteurs, Réponses, Reporting. En bas de sidebar : profil administrateur, bouton '< App' pour revenir à l'espace terrain, et bouton de déconnexion.
   - Écran 1 (Dashboard) : Vue d'ensemble avec 4 KPIs (Sondages: 3 dont 0 actifs, Enquêteurs: 12 utilisateurs actifs, Réponses totales: 649 collectées, Aujourd'hui: 0). Section 'Actions rapides' avec 3 cartes en bordure pointillée ('Créer un sondage', 'Gérer les enquêteurs', 'Voir les réponses').
   - Écran 2 (Sondages) : Bouton '+ Nouveau sondage' dégradé violet-cyan, barre de recherche, grille de cartes de questionnaires avec menu 3 points, badge Inactif/Actif, badge Public, nombre de questions et switch d'activation.
   - Écran 3 (Enquêteurs) : Bouton '+ Ajouter un enquêteur', recherche, grille de cartes enquêteurs avec avatar initiales, email, menu 3 points et badge 'X sondages'.
   - Écran 4 (Réponses) : Bouton 'Exporter CSV', filtres de recherche, sondage, enquêteur, dates début/fin. Tableau des réponses (Sondage, Enquêteur, Date avec icône horloge, GPS, Statut badge 'Terminé', action Corbeille).
   - Écran 5 (Reporting) : Boutons Actualiser, CSV, Excel. Filtres avec période de date, sondage, enquêteur. 4 cartes stats (Réponses totales, Taux d'achèvement, Enquêteurs actifs, Durée moyenne). Onglets 'Tendances', 'Par sondage', 'Par enquêteur' et graphique d'évolution journalière.

Implémenter l'ensemble avec données mockées interactives complètes (possibilité de créer/modifier sondages, ajouter enquêteurs, filtrer/supprimer réponses, basculer entre l'App terrain et le Back-Office avec le bouton '< App' et la carte 'Back-Office'). Respecter scrupuleusement la palette visuelle (violet profond, cyan #00b4d8, vert émeraude, orange doux), les polices, espacements et arrondis.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://waswia-data-quest.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ea42a1eb-2ffc-4121-ad78-bf62ef34a345).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
