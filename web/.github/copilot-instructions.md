<!-- Copilot / AI agent instructions for pawnshop web -->
# Quick Agent Guide - pawnshop web

This file gives focused, repo-specific guidance so an AI coding agent can be immediately productive.

- **Stack / entrypoints**: Vue 3 + Vite app. Main entry: `src/main.ts` (mounts `App.vue`, uses Pinia + router).
- **Project layout (important)**: shared code lives in `src/core/*`; the active feature lives under `src/feature/dashboard/*`.
- **Routing pattern**: the app router is composed in `src/core/util/router.ts`. The project currently exposes only the dashboard route.
- **Aliases**: TypeScript path aliases are defined in `tsconfig.app.json`: `@/*` -> `src/*`, `@core/*` -> `src/core/*`, `@feature/*` -> `src/feature/*`.
- **Socket integration**: Client socket factory is at `src/core/util/socket.ts`. It intentionally handles multiple `socket.io-client` export shapes and sets conservative `transports: ['polling']` by default.
- **Local DB**: RxDB is initialized in `src/core/data/datasources/db/core.db.ts` and is intended to work across browser and desktop webview runtimes.

- **Build / dev / test commands** (from `package.json`):
  - Install: `npm install`
  - Dev: `npm run dev` (multiple modes exist: `dev:local`, `dev:prod`)
  - Build: `npm run build` (and per-mode `build:dev`, `build:prod`)
  - Preview production build: `npm run preview`
  - Tests: `npm run test` (run once) and `npm run test:watch` (watch)
  - Lint / type-check / format: `npm run lint`, `npm run type-check`, `npm run format`

- **Tests & conventions**: unit tests are Vitest-based. When adding tests, use `fake-indexeddb` / `jsdom` where needed.
- **Code style & tooling**: ESLint + Prettier configured. Run `npm run lint` and `npm run format` before creating PRs. Type checking uses `vue-tsc` via `npm run type-check`.

- **Common patterns to follow**:
  - Keep shared UI in `src/core/presentation/components` and styles in `src/core/presentation/styles`.
  - Add new feature code under `src/feature/<name>/` only when the project actually needs that module.
  - Prefer datasource/repository abstractions over spreading raw Axios or socket calls across views.

- **Integration points & caveats**:
  - Socket client version is v2 in package.json; when changing socket code, preserve compatibility.
  - The router uses `import.meta.env.BASE_URL` for history base.
  - Bundled `dist/` exists but is build output and should not be edited directly.

- **Where to look for examples**:
  - App bootstrap: [src/main.ts](src/main.ts#L1-L40)
  - Router composition: [src/core/util/router.ts](src/core/util/router.ts#L1-L80)
  - Socket factory: [src/core/util/socket.ts](src/core/util/socket.ts#L1-L120)
  - Type aliases: [tsconfig.app.json](tsconfig.app.json#L1-L60)
