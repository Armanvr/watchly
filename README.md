# 🎬 Watchly — Calendrier de visionnage

Interface style Netflix × Google Calendar pour organiser vos films, séries et animes.

---

## Stack

| Côté | Technologies |
|---|---|
| **Backend** | Node 24 · Express · MongoDB Atlas · JWT |
| **Frontend** | React 18 · Vite · CSS Modules · React Router v6 |
| **API Média** | TMDB — films, séries TV, animes |
| **Qualité code** | Biome (lint + format) |

---

## Pré-requis

- Node.js ≥ 24
- Un compte [MongoDB Atlas](https://www.mongodb.com/atlas) (gratuit)
- Une clé API [TMDB](https://www.themoviedb.org/settings/api) (gratuite)

---

## Installation

### 1. Cloner et installer les dépendances

```bash
git clone https://github.com/votre-compte/watchly.git
cd watchly
npm install
```

### 2. Configurer les variables d'environnement

Créez un fichier **`.env`** à la racine du projet :

```env
# Backend
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/watchly
JWT_SECRET=une_chaine_secrete_longue_et_aleatoire
JWT_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
TMDB_API_KEY=votre_cle_tmdb_ici
TMDB_BASE_URL=https://api.themoviedb.org/3
FRONTEND_URL=http://localhost:5173

# Frontend (optionnel en dev — le proxy Vite gère /api)
VITE_API_URL=http://localhost:3001/api
VITE_TMDB_IMAGE_URL=https://image.tmdb.org/t/p
```

### 3. Lancer le projet

```bash
# Terminal 1 — Backend
npm run dev:server

# Terminal 2 — Frontend
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173)

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre Vite en développement (`src/`) |
| `npm run dev:server` | Démarre Express avec hot-reload (`server/`) |
| `npm run build` | Compile le frontend dans `dist/` |
| `npm run preview` | Prévisualise le build de production |
| `npm start` | Démarre le serveur en production |

---

## Fonctionnalités

| Feature | Description |
|---|---|
| 🔐 Auth | Inscription / Connexion JWT |
| 📅 Calendrier | Vue mensuelle avec dots colorés par type de média |
| 📋 Vue du jour | Tous les visionnages du jour sélectionné |
| 🔍 Recherche TMDB | Films, séries TV, animes |
| ➕ Ajout d'événement | Date, heure, épisode, notes, couleur personnalisée, statut |
| ✏️ Modification | Édition complète de chaque événement |
| 🗑 Suppression | Suppression d'un événement |
| 🔗 Partage lien | Lien token partageable (sans compte pour visualiser) |
| 👤 Partage utilisateur | Partage direct par pseudo ou email |
| 📊 Statuts | Prévu / En cours / Terminé / Abandonné |

---

## Structure du projet

```
watchly/
├── .env                    ← variables d'environnement (non versionné)
├── package.json            ← dépendances unifiées (front + back)
├── biome.json              ← config lint/format
├── render.yaml             ← déploiement Render
├── CHANGELOG.md
├── index.html
├── vite.config.js
├── src/                    ← application React/Vite
│   ├── App.jsx             ← routing
│   ├── index.css
│   ├── main.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── utils/
│   │   └── api.js          ← axios + intercepteurs JWT
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── CalendarPage.jsx
│   │   └── ShareAcceptPage.jsx
│   └── components/
│       ├── Navbar.jsx
│       ├── DayPanel.jsx
│       ├── EventModal.jsx
│       └── ShareModal.jsx
└── server/                 ← API Express
    ├── server.js           ← point d'entrée
    ├── models/
    │   ├── User.js
    │   └── WatchEvent.js
    ├── routes/
    │   ├── auth.js
    │   ├── events.js
    │   └── media.js
    └── middleware/
        └── authMiddleware.js
```

---

## Obtenir une clé TMDB

1. Créez un compte sur [themoviedb.org](https://www.themoviedb.org)
2. Allez dans **Paramètres → API**
3. Demandez une clé API (v3 auth)
4. Ajoutez-la dans votre fichier `.env` (`TMDB_API_KEY`)

---

## Déploiement (Render)

Le fichier `render.yaml` configure deux services :
- `watchly-backend` — service Node (Express), démarre avec `npm start`
- `watchly-frontend` — site statique, build Vite publié depuis `front/dist/`

Variables à renseigner dans le dashboard Render avant le premier déploiement :
- `MONGODB_URI` — chaîne de connexion MongoDB Atlas
- `TMDB_API_KEY` — clé API TMDB
- `FRONTEND_URL` — URL du frontend après son premier déploiement
- `VITE_API_URL` — URL de l'API backend (à définir **avant** le build frontend)
