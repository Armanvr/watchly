# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [Unreleased]

### Added
- Partage d'événement par lien token (sans compte pour visualiser)
- Partage direct par pseudo ou email
- Page d'acceptation de lien de partage (`/share/:token`)
- Recherche de médias via l'API TMDB (films, séries, animes)
- Détails enrichis au clic sur un résultat TMDB (durée, genres, note)
- Statuts de visionnage : Prévu / En cours / Terminé / Abandonné
- Couleur personnalisable par événement
- Champ épisode (ex : S01E05) et notes personnelles

---

## [0.2.0] — 2026-05-04

### Changed
- Renommage complet de **WatchCal** en **Watchly** dans tous les fichiers
  (UI, titre de page, noms de services Render, README)
- Réorganisation du projet en deux dossiers distincts :
  - `front/` — application React/Vite (`src/`, `components/`, `pages/`, `context/`, `utils/`)
  - `server/` — API Express (`routes/`, `models/`, `middleware/`)
- Fusion en un seul `package.json` à la racine (dépendances front + back unifiées)
- Scripts npm unifiés : `dev:front`, `dev:server`, `build`, `start`
- Mise à jour de `render.yaml` : suppression des `rootDir`, services renommés
  `watchly-backend` / `watchly-frontend`, `staticPublishPath` ajusté à `front/dist`
- README entièrement réécrit pour refléter la nouvelle structure et les nouveaux scripts

---

## [0.1.0] — 2026-05-04

### Added
- Authentification JWT (inscription, connexion, `/api/auth/me`)
- Recherche d'utilisateurs par pseudo ou email (`/api/auth/search`)
- Modèle `User` (Mongoose) avec hachage bcrypt et méthode `comparePassword`
- Modèle `WatchEvent` (Mongoose) avec index sur `owner + watchDate` et `sharedWith + watchDate`
- Routes CRUD événements (`GET`, `POST`, `PUT`, `DELETE /api/events`)
- Proxy TMDB : recherche multi/film/série/anime, détails, trending (`/api/media`)
- Middleware `protect` pour la vérification du token JWT
- Calendrier mensuel React avec navigation, dots colorés par type de média
- Panel du jour avec liste des événements, changement de statut inline
- Modal d'ajout/édition avec recherche TMDB intégrée en deux étapes
- Proxy Vite vers `localhost:3001` en développement
- Configuration de déploiement Render (`render.yaml`)
