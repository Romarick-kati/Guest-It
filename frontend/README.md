# ON Point — Frontend (Developer 1 scope)

Admin Dashboard + Core Game/Player Interface for **ON Point**, a multi-game
platform. **Guess it** is the first game running on it — the platform is
built to support more game types later (Prediction, Quiz, Challenge, ...).

Built with React, Vite, React Router and Tailwind CSS v4.

This covers **only** Developer 1's scope: the player game flow (browsing,
joining, paying, playing, results) and the full ON Point admin dashboard.
Sign up / sign in, player profile, game history, achievements, leaderboard,
and all backend/business logic belong to the other developers.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build to /dist
npm run preview   # preview the production build
```

The app defaults to `/games`, assuming the player is already logged in.
`/admin` is not gated behind a real login yet — that's the auth developer's
job once the backend is ready.

## Project structure

```
src/
├── components/
│   ├── ui/          Design-system primitives (Button, Card, Input, Modal,
│   │                 Dropdown, Toggle, Pagination, Skeleton, ...)
│   ├── game/         Game-domain components (GameCard, GameCountdown, ...)
│   ├── payment/       Payment UI (PaymentCard, PaymentSummary)
│   └── admin/         Admin components (GameTable, WinnerTable, GameForm,
│                       StatCard, ActiveGamesList, ActivityList, ...)
├── layouts/          PlayerLayout, AdminLayout, AdminSidebar, AdminHeader,
│                       AdminBreadcrumbs
├── pages/
│   ├── player/        Games, GameDetails, Payment*, Verification, GamePlay, ...
│   └── admin/          Dashboard, Games, Create/Edit, Live, Participants
│                       (per-game + platform-wide), Winners, Results,
│                       Users (+ detail), Transactions, Notifications,
│                       Settings (tabbed: General/Games/Payments/
│                       Notifications/Appearance/Language/Security)
├── context/
│   ├── ToastContext    Global notification toasts
│   └── ThemeContext    Light/dark/system theme + accent color, persisted
├── lib/
│   ├── mockData.js     Mock games, users, participants, winners,
│   │                    transactions, notifications, game types
│   ├── gameStatus.js    Shared status/formatting helpers
│   ├── usePagination.js Small client-side pagination hook
│   └── api.js           Thin "API service" layer — swap this for real
│                          fetch calls when the backend is ready. Pages
│                          never call fetch()/mock data directly.
└── App.jsx             Full route table
```

## Platform color system

Settings → Appearance (still one page, tabbed) now offers real, whole-platform
color control, not just a fixed preset list:

- 10 curated accent presets (red through pink)
- A **custom color picker** (native color input) plus a hex text field, so
  an admin can set literally any accent color
- A **live preview** on the same page (button/badge/link/progress bar) so
  the effect is obvious immediately, before navigating anywhere else
- Custom colors are handled by `src/lib/color.js`, which derives readable
  hover/soft variants from any hex value and adapts them for light vs dark
  mode automatically — no per-color CSS to hand-write
- Everything is stored in `localStorage` and re-applied on load via
  `ThemeContext`, so the choice persists across sessions

## Finding the admin dashboard

There's no real login yet (that's Developer 2's scope), so opening the app
at `/` shows a temporary landing page (`src/pages/Landing.jsx`) with two
options: **Continue as Player** (→ `/games`) or **Continue as Admin**
(→ `/admin`). There's also a permanent "Admin dashboard" link in the player
footer. Once real authentication exists, replace the `/` route in
`App.jsx` so each role lands directly on their own section instead of
seeing this switcher.

## Sortable tables

Games, Users, Winners, and Transactions tables all support click-to-sort
columns (click again to reverse direction) via the shared
`lib/useSortableData.js` hook and `components/ui/SortableTh.jsx` header
cell. This isn't a single generic `<DataTable />` — each table is still its
own component — but sorting behavior and the header UI are consistent and
reused everywhere it's needed.

## Branding

The real ON Point logo lives in `src/assets/` (`onpoint-mark.png` for the
compact icon, `onpoint-full.png` for the full icon+wordmark+tagline lockup)
and is served through the reusable `<Logo />` component
(`src/components/ui/Logo.jsx`).

- Use `<Logo variant="mark" />` anywhere small/compact — headers, sidebars,
  favicons. It reads well on both light and dark surfaces.
- Use `<Logo variant="full" />` only on dark surfaces — the wordmark is
  white and disappears on light backgrounds. Currently used on the
  branded splash screen (`components/ui/SplashScreen.jsx`) shown briefly
  on first load.
- The mark has a built-in entrance animation (pops in once on mount) and a
  hover micro-interaction (slight rotate + glow). All animations respect
  `prefers-reduced-motion`. Page navigations also get a subtle fade/slide
  transition — see `.page-transition` in `src/index.css`.
- The favicon (`public/favicon.png`, plus 192/32px variants) is generated
  from the same mark.

## Theming (light/dark + accent color)

All colors, fonts and surface tokens live in `src/index.css` under `@theme`,
with dark-mode overrides under `.dark` and accent-color overrides under
`[data-accent="..."]`. `ThemeContext` toggles the `dark` class and
`data-accent` attribute on `<html>` and persists the choice. The whole app
(player + admin) shares these tokens — there is no separate admin design
system, per the brief.

Change the admin theme live from **Settings → Appearance**, or toggle
light/dark from the sun/moon icon in the admin header.

## Extensible game types

Games aren't hardcoded to Guess it. `lib/mockData.js` exports `GAME_TYPES`
(Guessing Game, Prediction Game, Quiz, Challenge) and every game record has
a `gameType` field. `GameForm` (used by both Create and Edit) includes a
Game Type selector, and `GameTable` shows the type as its own column. Adding
a new game type later means adding an entry to `GAME_TYPES` — no component
changes required.

## Connecting the real backend

Only `src/lib/api.js` should need to change. Each function currently reads
from `mockData.js`; replace the internals with real `fetch`/API-client calls
that match the contracts the backend developer provides. No page or
component should need to change as a result.

## What's intentionally UI-only

- Winner selection / eligibility logic (backend)
- Payment gateway integration — checkout UI simulates
  processing → success/failed/cancelled states only
- Facial recognition — `/games/:id/verify` is UI-only
- Live game controls (+10s/+30s/Pause/Resume/End) — visual only, backend
  decides if they actually succeed
- Security settings (2FA, sessions) — visual only
- Real countdown authority — `<GameCountdown />` ticks visually but the
  backend is the source of truth for whether a game has actually ended
- Auth, player profile, game history, achievements, leaderboard (Developer 2)
