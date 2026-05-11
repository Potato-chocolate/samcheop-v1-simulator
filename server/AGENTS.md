<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# server

## Purpose
Express HTTP listener that bundles tRPC, OAuth callback, storage proxy, and the Vite dev middleware (development) or static file server (production) into a single process. tRPC types defined here are imported by the client (`client/src/lib/trpc.ts` → `AppRouter`), so router shape changes are client-wide breaking changes.

## Key Files
| File | Description |
|------|-------------|
| `routers.ts` | Root tRPC router. Exports `appRouter` and the `AppRouter` type. Owns the `reports` and `auth` namespaces and the HTML report renderer (`buildReportHtml`) |
| `db.ts` | Lazy drizzle (mysql2) instance + user/report CRUD. Returns `null` when `DATABASE_URL` is absent so local tooling and tests run without MySQL. `requireDb()` throws |
| `storage.ts` | `storagePut` / `storageGet` / `storageGetSignedUrl` against Forge presigned S3 URLs. Always returns `/manus-storage/{key}` paths — never bare S3 URLs |
| `index.ts` | Thin re-export shim; the real entry is `_core/index.ts` (set by `package.json` scripts) |
| `auth.logout.test.ts` | Verifies logout clears the `app_session_id` cookie via the protected procedure |
| `reports.router.test.ts` | Covers `reports.save/list/getBySlug/delete` end-to-end via the router |
| `ui.qa.test.ts` | Smoke check on rendered report HTML / UI text |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `_core/` | Express bootstrap, tRPC plumbing, auth/SDK/storage primitives (see `_core/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- **`AppRouter` is a public contract.** Renaming or removing a procedure breaks the client's tRPC types at compile time. Run `pnpm check` and the client test file after changing `routers.ts`.
- All routes must live under `/api/*` — the gateway only routes that prefix to the server. tRPC is mounted at `/api/trpc`; raw Express routes (OAuth, storage proxy) register via `server/_core/*` helpers.
- `reports.save` writes four NOT-NULL JSON columns (`revenueInputsJson`, `costInputsJson`, `revenueSummaryJson`, `openingSummaryJson`). Never insert a partial row.
- The HTML report (`buildReportHtml`) is rendered server-side as a self-contained document — inline CSS only, no external assets. Keep `escapeHtml` on every interpolated user value.
- Procedure types: `publicProcedure` (no auth), `protectedProcedure` (`ctx.user` required, throws `UNAUTHED_ERR_MSG = "Please login (10001)"`), `adminProcedure` (`role === "admin"`, throws `NOT_ADMIN_ERR_MSG`). Match the threshold to actual auth need — using `protectedProcedure` for what should be public triggers an unwanted browser redirect to the login URL.

### Testing Requirements
- Server tests invoke routers directly (no real HTTP server). They run without MySQL — write router code that tolerates `getDb()` returning `null` when applicable.
- `pnpm test server/reports.router.test.ts` for the heaviest suite.

### Common Patterns
- File-scoped Zod schemas in `routers.ts` (e.g. `revenueInputsSchema`) double as the JSON contract for stored reports — keep parser/serializer (`parseJsonField`, `serializeReport`) in lockstep.
- KRW formatting helpers (`fmtWon`, `fmtCompact`, `fmtPct`) are duplicated in `routers.ts` purely for the server-rendered report. The client has its own copies — don't try to share them yet.

## Dependencies

### Internal
- `../drizzle/schema.ts` — drizzle table definitions + `$inferSelect`/`$inferInsert` types
- `../shared/const.ts` — `COOKIE_NAME`, `UNAUTHED_ERR_MSG`, `NOT_ADMIN_ERR_MSG`

### External
- `@trpc/server`, `@trpc/server/adapters/express`, `zod`, `superjson`
- `express`, `cookie`
- `drizzle-orm/mysql2`, `mysql2`
- `nanoid` (24-char share slugs)
- `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` (Forge presigning replaces direct usage)

<!-- MANUAL: -->
