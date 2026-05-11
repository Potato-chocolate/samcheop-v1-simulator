# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: 삼첩분식 v1 상담 시뮬레이터

A franchise-counseling simulator for the 삼첩분식 (Samcheop Bunsik) brand. The single-page calculator helps consultants and prospective franchisees estimate target revenue, P&L, and store-opening costs sourced from the v1 Excel workbooks. Numerical assumptions and their derivations live in `v1_excel_config_spec.md` — treat that file as the source of truth when adjusting calculation constants.

## Commands

```bash
pnpm dev          # tsx watch on server/_core/index.ts (Vite middleware in dev)
pnpm build        # Vite client build + esbuild server bundle to dist/
pnpm start        # node dist/index.js (production)
pnpm check        # tsc --noEmit
pnpm test         # vitest run (server/**/*.{test,spec}.ts + client/src/**/*.test.ts)
pnpm test -- -t "공과금"     # run a single test by name (regex match)
pnpm test client/src/pages/Home.calculations.test.ts   # run one file
pnpm format       # prettier --write .
pnpm db:push      # drizzle-kit generate && migrate  (requires DATABASE_URL)
node scripts/validate_simulator_config.mjs   # recompute CONFIG → simulator_config_validation.json
```

`pnpm dev` reads `NODE_ENV=development` and the Linux-style env assignment in `package.json` may not work in bare PowerShell; use Git Bash / WSL or set `$env:NODE_ENV` before invoking `tsx watch server/_core/index.ts`.

## Architecture

**Three-layer monorepo with a Vite dev-middleware server.** Express owns the HTTP listener; in development it mounts Vite as middleware (`server/_core/vite.ts`), in production it serves `dist/public`. The same Express process exposes:

- `/api/trpc/*` — tRPC v11 with superjson transformer, batched HTTP link
- `/api/oauth/*` — Manus OAuth callback (`server/_core/oauth.ts`)
- `/manus-storage/*` — 307 proxy to Forge-presigned S3 URLs (`server/_core/storageProxy.ts`)

**tRPC router shape** (`server/routers.ts`): `system`, `auth { me, logout }`, `reports { save, list, getBySlug, delete }`. Procedure types:
- `publicProcedure` — no auth required
- `protectedProcedure` — requires `ctx.user` (throws `UNAUTHED_ERR_MSG = "Please login (10001)"`)
- `adminProcedure` — requires `ctx.user.role === "admin"` (throws `NOT_ADMIN_ERR_MSG = "(10002)"`)

`createContext` (`server/_core/context.ts`) calls `sdk.authenticateRequest` and **swallows auth failures to `null`** so public procedures keep working — never throw in the context creator.

**Frontend → backend client typing** flows through `client/src/lib/trpc.ts`, which imports `AppRouter` from `../../../server/routers`. Keep `server/routers.ts` exports stable; touching its shape is a client-wide type change.

**OAuth-to-login redirect.** The client's TanStack Query cache subscriber (`client/src/main.tsx`) inspects every TRPCClientError; if `error.message === UNAUTHED_ERR_MSG` it sends the browser to `getLoginUrl()`. Anything that should fail silently on unauthenticated users must use `publicProcedure` rather than `protectedProcedure`.

**Database.** `server/db.ts` lazily creates a single drizzle (`mysql2`) instance only when `DATABASE_URL` is set. Tooling and tests run without a DB — many helpers no-op and log when `getDb()` returns `null`. `requireDb()` throws; use it only inside routes that genuinely need MySQL. Schema lives at `drizzle/schema.ts`; migrations at `drizzle/*.sql`. Owner promotion is automatic when `user.openId === ENV.ownerOpenId` (set via `OWNER_OPEN_ID`).

**Storage.** `server/storage.ts` PUTs to S3 via Forge-presigned URLs (`BUILT_IN_FORGE_API_URL` + `BUILT_IN_FORGE_API_KEY`). Returned `url` is always `/manus-storage/{key}` — never an absolute S3 URL — because the storage proxy redirects clients with fresh signatures. Each upload appends an 8-char hex suffix to avoid collisions.

**Report save flow** (`reports.save`): renders self-contained branded HTML server-side via `buildReportHtml`, uploads to S3, then writes a `consultationReports` row whose `revenueInputsJson` / `costInputsJson` / `revenueSummaryJson` / `openingSummaryJson` are stringified inputs+results. `serializeReport` parses them back when the row is read. **All four JSON columns are required NOT NULL** — never skip them on insert.

## Frontend

**Single-page app.** `client/src/pages/Home.tsx` is the entire product surface. It owns the 1첩 (인근매장 매출 조회 — 개발중) → 2첩 (목표 매출 입력) → 3첩 (창업 비용 계산) consultation flow plus exports `calculateRevenue` and `CHANNELS` that the test suite consumes. The `SharedReport` page renders a saved report by `shareSlug`.

**Vite aliases** (mirrored in `tsconfig.json` and `vitest.config.ts`): `@` → `client/src`, `@shared` → `shared`, `@assets` → `attached_assets`. The Vite `root` is `client/`, not the repo root — static assets go in `client/public/`.

**Vite dev plugins.** `vitePluginManusDebugCollector` (defined inline in `vite.config.ts`) writes browser console/network/session replay logs to `.manus-logs/*.log` with 1MB rolling trim; `jsxLocPlugin` and `vitePluginManusRuntime` are Manus-specific. None are active in production builds.

## Tests

`vitest.config.ts` uses the **node environment** — there is no jsdom. Frontend tests assert against `Home.tsx` source text read via `readFileSync` (e.g. checking JSX strings, class names, formatting templates) rather than rendering components. When refactoring `Home.tsx`, expect to update these string-match assertions in `client/src/pages/Home.calculations.test.ts`.

Server tests (`server/*.test.ts`) cover the auth logout cookie clear, the reports router, and a UI QA smoke. They run without a live DB by exercising the router directly.

## Conventions

- TypeScript strict, ESM (`"type": "module"`), `moduleResolution: bundler`, `allowImportingTsExtensions`.
- Prettier: semi=true, singleQuote=false, printWidth=80, arrowParens=avoid, endOfLine=lf.
- Currency formatting: `fmtWon` uses `Intl.NumberFormat("ko-KR", {currency:"KRW"})`; `fmtCompact` shows `만원` units. Reuse these in any new revenue display — don't hand-roll.
- Money values in business logic are stored as raw KRW numbers (no cents); margins/ratios are decimals 0–1 and rendered with `fmtPct`.
- All shared constants between client and server live in `shared/const.ts`. `COOKIE_NAME`, `UNAUTHED_ERR_MSG`, `NOT_ADMIN_ERR_MSG` must stay identical on both sides — the client matches on string equality.
- Korean is the product language. UI copy, comments tied to business rules, and commit messages are typically Korean; identifiers and APIs stay English.

## Things to know before changing calculations

- The default `monthlySales` (32,344,100원) and `partTime` (2.5명) are derived from the Excel workbook, not arbitrary. Cross-reference `v1_excel_config_spec.md` §3 before tuning.
- Channel mix in `CHANNELS` must sum to ~100% and stay sorted descending by `ratio` — `Home.calculations.test.ts` enforces both.
- Fixed-cost utilities are auto-computed as `monthlySales × 3.5%` and folded into `result.fixed`; do not re-add a utilities input.
- BEP is found by binary search up to ₩70,000,000 — bump the bound if you change the cost structure to allow higher break-even.

## **관련 문서 최신화**[중요]
- 메인 폴더와 각 폴더에 있는 AGENTS.md 는 코드가 수정, 변경, 추가, 신규가 생겼을 때 최신화 또는 신규 AGENTS.md 를 만든다.
- AGENTS.md 와 마찬가지로 CLAUDE.md 를 최신화 한다. CLAUDE.md 는 250줄 이하로 효율적인 문맥으로 관리한다. 
- CLAUDE.md 는 사용자가 아닌 오직 클로드 코드 만을 위한 파일이다. 클로드 코드 가 참고하기 편하게 작성한다. 
- 사용자가 세션을 종료하겠다고 하면 해당 세션에서 필요하다 판단되는 것은 memory 에 기억한다.

## Deployment (GitHub Pages, static)

- 워크플로: `.github/workflows/deploy-pages.yml` — `main` push/`workflow_dispatch` 트리거. `pnpm build` → `dist/public/` 업로드. SPA fallback `404.html`은 빌드 후 워크플로에서 복사.
- Base path: `vite.config.ts`의 `base: "/samcheop-v1-simulator/"`. 자산은 `/samcheop-v1-simulator/assets/...`로 빌드됨. 레포 rename 시 동시 갱신 필수.
- `client/index.html` 의 `%VITE_ANALYTICS_*%` 분석 스크립트는 정적 배포에서 빈 값 치환으로 404 유발 → 제거 상태.
- 정적 배포에서 동작 안 함: OAuth, tRPC API (`reports.*`), `/manus-storage/*`. `client/src/pages/Home.tsx`(메인 시뮬레이터)는 백엔드 의존 0 → 정상 동작.
- 공개 URL: `https://potato-chocolate.github.io/samcheop-v1-simulator/`.
