<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# client

## Purpose
Vite-served React 19 single-page application. The Vite `root` is **this directory** (not the repo root), so static assets under `public/` are served at `/`, and import paths from server-side code into this tree must go via the Vite middleware in development or the prebuilt `dist/public/` bundle in production.

## Key Files
This directory has no source files of its own — it is the Vite project root scaffold pointing at `src/` and `public/`.

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `src/` | React application source (see `src/AGENTS.md`) |
| `public/` | Static assets served at site root (see `public/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Vite `index.html` is expected to live at `client/index.html` (referenced by Vite root). Do not move it.
- Anything in `public/` is copied verbatim to `dist/public/` — no transform.
- The dev server is wired in `server/_core/vite.ts` via `setupVite(app, server)`; production uses `serveStatic(app)` which serves `dist/public`.

### Testing Requirements
- Client tests live under `src/**/*.test.ts` and run inside the same `pnpm test` suite. They are **node-environment** tests (no DOM) — see `src/pages/Home.calculations.test.ts` for the pattern.

### Common Patterns
- Aliases (mirrored in `tsconfig.json` and `vitest.config.ts`): `@` → `src/`, `@shared` → `../shared/`, `@assets` → `../attached_assets/`.

## Dependencies

### Internal
- `../server/routers.ts` — imported by `src/lib/trpc.ts` purely for `AppRouter` type
- `../shared/*` — runtime + type imports via `@shared`

### External
- React 19, wouter, TanStack Query v5, tRPC client/react-query
- Tailwind CSS v4, shadcn/ui Radix components, lucide-react icons
- framer-motion, recharts, sonner, embla-carousel, react-day-picker, react-hook-form, zod

<!-- MANUAL: -->
