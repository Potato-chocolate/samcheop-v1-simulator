<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# src

## Purpose
React 19 application source. Owns the React tree (`App`, `Router`, providers), the global CSS, the wouter route table (`/`, `/404`, fallback), and the bootstrap that mounts the tRPC client and TanStack Query into the DOM.

## Key Files
| File | Description |
|------|-------------|
| `main.tsx` | DOM mount, tRPC `httpBatchLink` client (`/api/trpc`, `credentials: include`, superjson transformer), and the query/mutation cache subscribers that redirect to `getLoginUrl()` whenever a tRPC error matches `UNAUTHED_ERR_MSG` |
| `App.tsx` | Top-level providers (`ErrorBoundary`, `ThemeProvider` defaulting to "light", `TooltipProvider`, sonner `Toaster`) and the wouter `<Switch>` (currently `/`, `/404`, and fallback to NotFound) |
| `const.ts` | Client-only constants (`getLoginUrl()` derived from `VITE_OAUTH_PORTAL_URL` + `VITE_APP_ID` + current origin) plus re-exports from `@shared/const` |
| `index.css` | Global Tailwind CSS v4 entrypoint and theme tokens (red/yellow/cream "삼첩분식" palette referenced by `Home.tsx` design comments) |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `_core/` | Manus template hooks reserved for OAuth/auth flows (see `_core/AGENTS.md`) |
| `components/` | Application + shadcn/ui components (see `components/AGENTS.md`) |
| `contexts/` | React context providers — currently theme only (see `contexts/AGENTS.md`) |
| `hooks/` | Generic custom hooks (see `hooks/AGENTS.md`) |
| `lib/` | Cross-cutting utilities — tRPC client setup, `cn()` (see `lib/AGENTS.md`) |
| `pages/` | wouter route components — the actual product surface (see `pages/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- **The login-redirect mechanism is global.** Both the query cache and the mutation cache subscribers in `main.tsx` listen for `error.message === UNAUTHED_ERR_MSG` and force a `window.location.href` jump. Any new caller of a `protectedProcedure` therefore inherits this behavior automatically — but it also means an over-zealous `protectedProcedure` will redirect logged-out anonymous visitors out of the simulator.
- The product runs anonymously today. `App.tsx` does not gate any route on auth — login is only needed for `reports.save/list/delete`.
- `ThemeProvider` defaults to "light" and is **not switchable** by default (`switchable` prop is omitted). Don't add a dark-mode toggle without checking the brand styling in `index.css`.
- Routes are wouter, not React Router. Use `<Route path>` / `<Switch>` and `useLocation`/`useRoute` from `wouter`.

### Testing Requirements
- Tests run in the **node environment** — no jsdom, no React rendering. The existing pattern (`pages/Home.calculations.test.ts`) imports pure functions and asserts against the source file read as text. Continue this pattern; don't add `@testing-library/react` unless the test config is reconfigured.

### Common Patterns
- `import { trpc } from "@/lib/trpc"`; mutations and queries always go through this typed client.
- `cn(...)` from `@/lib/utils` for conditional class names.
- All paths use the `@/` alias rather than relative imports across folders.

## Dependencies

### Internal
- `../../server/routers.ts` — type-only import for `AppRouter`
- `../../shared/*` — runtime imports via `@shared/*`

### External
- React 19, react-dom, wouter, TanStack Query v5, tRPC react-query, superjson

<!-- MANUAL: -->
