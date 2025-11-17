## Quick context

This repository is a small Vite + React frontend app (source in `src/`) with a lightweight service layer under `services/` and a few top-level helper modules. Key paths you will want to inspect:

- `src/main.jsx` — app entry (mounts React tree)
- `src/components/` — UI components (e.g. `StartButton/Start.jsx`, `TransactionList.js`)
- `services/` and `api/` — business/service logic (e.g. `services/BalanceService.js`, `api/ApiSyncClient.js`)
- `TransactionService.js` — top-level helper/service used across the app
- `vite.config.js` and `package.json` — build and dev scripts (run `npm install` then `npm run dev` / `npm run build` — confirm exact scripts in `package.json`)

## Architecture summary (what to know fast)

- Small single-page React app served by Vite. The React app starts at `src/main.jsx` and composes components from `src/components/` and `src/containers/`.
- Data & sync logic is implemented as plain JS modules under `services/` and `api/` rather than a global state manager. Components import and call service functions directly (example: `TransactionList` uses services to fetch transactions).
- There are both top-level helper files (e.g. `TransactionService.js`) and a `services/` folder containing domain-specific functionality. Prefer changing the domain service modules when adding business logic.

## Coding patterns and conventions to follow

- Module style: plain ES modules (import/export); follow existing naming (camelCase functions, PascalCase React components).
- Services return plain JS objects/arrays. Components call services and handle local UI state; there is no central store (Redux/MobX) in this codebase.
- Side effects (network, local storage) are centralized in `api/` and `services/` files — add new network calls there rather than inside components.
- CSS is simple global CSS under `src/style/style.css` — prefer existing classes rather than introducing a new CSS-in-JS approach.

## Build / dev / debug (practical commands)

1. Install deps: `npm ci` or `npm install` from the repository root.
2. Start dev server: `npm run dev` (this is the conventional Vite script; check `package.json` to confirm exact script name if different).
3. Build for production: `npm run build` (Vite build). Preview production build: `npm run preview` or `npm run serve` depending on `package.json` scripts.

Note: If a script name differs, open `package.json` at the repository root to use the exact script.

## Typical edit workflow for features/bugfixes

- Modify or add functions in `services/` (business logic) and `api/` (network). Keep components thin — they should call service functions and render results.
- Export and unit-test service functions where possible (no test runner currently provided in repo; add tests under a `tests/` folder if you introduce a test framework).
- Update `src/components/...` and `src/containers/...` to use changed service APIs.

## Integration points & gotchas

- `api/ApiSyncClient.js` is the main place for network communication and sync semantics — ensure any new network endpoints are wired here.
- `TransactionService.js` is referenced in multiple places; double-check imports before refactoring.
- The project uses Vite — imports of non-JS assets must follow Vite/ESM semantics (use `import img from './img.png'` for static assets under `src/assets`).

## Examples (patterns found in repo)

- Service import in a component: `import { getBalance } from '../../services/BalanceService'`
- Component entry: `src/main.jsx` imports the root component and mounts React.

## When to ask the maintainers

- If you need to change the build or add server-side code (this repo is only the frontend), check whether a complementary backend repo exists.
- If you plan to add a global state manager (Redux, Zustand) — discuss with maintainers; current pattern is service-driven.

## Where to check for more details

- `package.json` — confirm exact dev/build scripts and dependency versions
- `vite.config.js` — Vite-specific settings (aliases, plugins)
- `TransactionService.js`, `services/`, `api/` — central logic to read before editing features

If anything looks off or you'd like me to pull exact scripts and small code snippets from `package.json` and other files, tell me and I will open and merge those exact values into this file.
