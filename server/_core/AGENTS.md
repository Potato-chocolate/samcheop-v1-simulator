<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# _core

## Purpose
Manus template-provided server primitives that the application sits on top of: HTTP listener bootstrap, tRPC initialization, OAuth/session, SDK glue against the Manus identity service, env validation, storage proxy, scheduled-job (heartbeat) registry, LLM/voice/image/maps helpers, and the dev-vs-prod Vite middleware switch. Application-specific routers/business logic belong in the parent `server/` directory, not here.

## Key Files
| File | Description |
|------|-------------|
| `index.ts` | **Real entrypoint** (referenced by `package.json` scripts). Boots Express, configures 50MB JSON body limit, mounts the storage proxy + OAuth + tRPC at `/api/trpc`, switches Vite middleware ↔ static serving by `NODE_ENV`, finds the next free port from `PORT||3000` and listens |
| `trpc.ts` | `initTRPC.create({ transformer: superjson })`. Exports `router`, `publicProcedure`, `protectedProcedure` (throws `UNAUTHED_ERR_MSG`), `adminProcedure` (throws `NOT_ADMIN_ERR_MSG`) |
| `context.ts` | `createContext` for tRPC. Calls `sdk.authenticateRequest(req)` and **swallows failures to `user: null`** so public routes still work for anonymous visitors |
| `sdk.ts` | OAuth client against the Manus identity service. Exchange token, fetch user info, mint/verify a JWT session cookie (`COOKIE_NAME`, `ONE_YEAR_MS` TTL), `authenticateRequest(req)` returns `User | null` |
| `oauth.ts` | Registers `/api/oauth/callback` — exchanges the code, fetches user info, upserts via `server/db.ts`, sets the session cookie |
| `cookies.ts` | `getSessionCookieOptions(req)` — secure cookie attributes derived from the request |
| `env.ts` | The single `ENV` object reading `VITE_APP_ID`, `JWT_SECRET`, `DATABASE_URL`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`, `NODE_ENV` |
| `vite.ts` | `setupVite(app, server)` for dev mode HMR, `serveStatic(app)` for production (`dist/public`) |
| `storageProxy.ts` | `GET /manus-storage/*` — Forge presign → 307 redirect with a fresh signed URL |
| `systemRouter.ts` | `system.health` (public) + `system.notifyOwner` (admin). Mounted at the root of `appRouter` |
| `notification.ts` | `notifyOwner({title, content})` — backend for `system.notifyOwner` |
| `heartbeat.ts` | Scheduled job registry. Cron is 6-field UTC, paths must start with `/api/scheduled/`. **Read `../../references/periodic-updates.md` before extending** |
| `llm.ts`, `imageGeneration.ts`, `voiceTranscription.ts`, `map.ts`, `dataApi.ts` | Manus platform helper SDKs (LLM completions, image gen, STT, Maps, generic data API). Use these for any platform integration instead of calling external APIs directly |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `types/` | Type declarations for cookie module + Manus identity-service DTOs (see `types/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- **Don't move the real entrypoint.** `package.json`'s `dev`/`build` scripts both target `server/_core/index.ts`. Keep `server/index.ts` as a thin shim if it exists.
- This folder is template plumbing — prefer extending behavior in `../routers.ts` or in new `server/*.ts` files rather than mutating files here. When upstream Manus template updates land, having minimal local diffs in `_core/` makes the merge tractable.
- All new HTTP routes register on the `app: Express` passed into the bootstrap. Always prefix with `/api/` — the gateway only routes that prefix to this server.
- Scheduled work (cron/heartbeat) **must not** use `setInterval`/`node-cron`. Use the heartbeat registry in `heartbeat.ts` and a callback under `/api/scheduled/*`. See `../../references/periodic-updates.md`.
- Auth pattern: `sdk.authenticateRequest(req)` is the single source of truth. Don't re-implement JWT verification; route everything through the SDK so cron, OAuth callbacks, and tRPC procedures share semantics.

### Testing Requirements
- No tests live here directly. Behaviors are exercised by `../auth.logout.test.ts`, `../reports.router.test.ts`, and `../ui.qa.test.ts`.

### Common Patterns
- Module side-effects: each `register*(app)` function attaches its routes to the provided Express instance — never imports `app` from elsewhere.
- Env reads centralize through `ENV` from `env.ts`; don't reach into `process.env` from feature files.

## Dependencies

### Internal
- `../../shared/const.ts` (`COOKIE_NAME`, `UNAUTHED_ERR_MSG`, `NOT_ADMIN_ERR_MSG`, `ONE_YEAR_MS`, `AXIOS_TIMEOUT_MS`)
- `../../shared/_core/errors.ts` (`ForbiddenError` etc.)
- `../db.ts` (consumed by `oauth.ts` for the upsert flow)
- `../../drizzle/schema.ts` (`User` type)

### External
- `express`, `@trpc/server`, `@trpc/server/adapters/express`, `superjson`, `zod`
- `axios`, `jose` (JWT), `cookie`
- Vite (`createServer`, `createLogger`) — only loaded in dev mode

<!-- MANUAL: -->
