# Watchly — Design System

## Design Tokens (`src/index.css`)

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--surface-0` | `#070e22` | Page background |
| `--surface-1` | `#0e1a36` | Footer, secondary surfaces |
| `--surface-2` | `#142040` | Cards, inputs |
| `--surface-3` | `#1a2a55` | Hover states, borders |
| `--surface-card` | `rgba(20,32,64,0.85)` | Modal/card glass |
| `--accent` | `#2563eb` | Primary CTA, links |
| `--accent-hover` | `#3b82f6` | Hover on accent |
| `--accent-glow` | `rgba(37,99,235,0.35)` | Glow effects |
| `--text-primary` | `#f0f4ff` | Body text |
| `--text-secondary` | `#94a3c4` | Labels, secondary |
| `--text-muted` | `#4a5980` | Placeholders, meta |

### Media type colors
- Movie: `--movie-color` `#2563eb`
- TV: `--tv-color` `#7c3aed`
- Anime: `--anime-color` `#db2777`

### Status colors
- Planned: `--planned-color` `#2563eb`
- Watching: `--watching-color` `#d97706`
- Completed: `--completed-color` `#16a34a`
- Dropped: `--dropped-color` `#dc2626`

### Typography
- Display: `--font-display` → Bebas Neue (titles, logo)
- Body: `--font-body` → DM Sans (all other text)

### Radii
- `--radius-sm`: 6px
- `--radius-md`: 12px
- `--radius-lg`: 18px
- `--radius-xl`: 24px

### Shadows
- `--shadow-card`: `0 4px 24px rgba(0,0,0,0.4)`
- `--shadow-modal`: `0 24px 80px rgba(0,0,0,0.7)`
- `--shadow-glow`: `0 0 40px rgba(37,99,235,0.2)`

### Transitions
- `--transition`: `0.2s cubic-bezier(0.4,0,0.2,1)`

## Animations (defined in `index.css`)
- `fadeIn` — opacity 0→1 + translateY 12px→0
- `slideIn` — opacity 0→1 + translateX -16px→0
- `scaleIn` — opacity 0→1 + scale 0.94→1
- `shimmer` — skeleton loading gradient
- `pulse-glow` — glow pulse on accent

Utility classes: `.fade-in`, `.scale-in`, `.skeleton`, `.sr-only`, `.size-6` (1.5rem icon)

## Components

### Header (`src/components/Header.jsx`)
- Guest mode: logo + "Connexion" + "S'inscrire" buttons
- Auth mode: logo + nav links (/app, /profile) + avatar dropdown
- Height: 64px, sticky top, backdrop-filter blur

### Footer (`src/components/Footer.jsx`)
- Copyright only: `© 2026 Watchly`
- Background: `--surface-1`, centered

### EventModal (`src/components/EventModal.jsx`)
- Full form: media search, type, date/time, episode (tv/anime only), status, shared users
- Debounced TMDB search (300ms)

### EventDetailModal (`src/components/EventDetailModal.jsx`)
- Backdrop image + gradient, poster, info grid
- Actions: edit, share, delete

### DayPanel (`src/components/DayPanel.jsx`)
- Timeline 11:00–23:00, 2px/min
- Poster cards 48×72px
- Auto-scroll to first event, now-line (blue), past veil

### ShareModal (`src/components/ShareModal.jsx`)
- Share link tab + shared users management

## Pages

### LandingPage (`/`) — public
- Hero: TMDB backdrop + gradient + title + CTA
- Trending: horizontal scroll of TMDB poster cards
- Features: 3 cards

### CalendarPage (`/app`) — protected
- Calendar grid (month view) + DayPanel side by side

### LoginPage (`/login`) — guest only
### RegisterPage (`/register`) — guest only
### ProfilePage (`/profile`) — protected
- User info display + change password form
### ShareAcceptPage (`/share/:token`) — public

## Icons (`src/icons/`)
Pattern: `import Clock from '../icons/Clock'` → `<Clock className="size-6" />`
- `Clock` — time
- `Duration` — calendar/duration
- `Share` — share/link
- `Trash` — delete
- `Pencil` — edit
- `Tv` — TV type

## TMDB Integration
- Backend proxy: `server/routes/media.js`
- Image base URL: `VITE_TMDB_IMAGE_URL` = `https://image.tmdb.org/t/p`
- Poster sizes: `w342` (cards), `w500` (detail), `original` (backdrop)
- Public endpoints (no auth): `GET /api/media/trending`
- Protected endpoints: `GET /api/media/search`, `GET /api/media/details/:type/:id`

## Routing
| Path | Component | Guard |
|------|-----------|-------|
| `/` | LandingPage | Redirects authed users → `/app` |
| `/app` | CalendarPage | Protected |
| `/profile` | ProfilePage | Protected |
| `/login` | LoginPage | Guest only |
| `/register` | RegisterPage | Guest only |
| `/share/:token` | ShareAcceptPage | Public |
