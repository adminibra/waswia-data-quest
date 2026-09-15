# Reproduction de l’application WASWIA

## Objectif
Reconstruire fidèlement les deux espaces visibles sur les captures, avec une navigation complète et des données simulées modifiables en mémoire.

## Écrans
- `/auth` : connexion WASWIA avec champs email/mot de passe et affichage du mot de passe.
- `/` : accueil terrain, synchronisation, compteurs, accès au back-office et liste des sondages.
- `/admin` : tableau de bord avec indicateurs et actions rapides.
- `/admin/surveys` : recherche, création, modification et activation des sondages.
- `/admin/investigators` : recherche et ajout d’enquêteurs.
- `/admin/responses` : recherche, filtres, suppression et export CSV.
- `/admin/reporting` : filtres, indicateurs, onglets et graphique journalier.

## Expérience
- Reprendre la palette violet profond, cyan, vert et orange, la typographie, les ombres, rayons et espacements des captures.
- Construire une barre latérale rétractable sur ordinateur et un menu adapté au mobile.
- Permettre le passage entre l’espace terrain et le back-office.
- Ajouter des fenêtres de création/modification et des menus fonctionnels.
- Utiliser uniquement des données de démonstration en mémoire, sans compte réel ni stockage permanent.

## Vérification
- Vérifier chaque écran et les principaux parcours sur ordinateur et mobile.
- Contrôler les erreurs d’affichage et de compilation avant livraison.
