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

`pnpm dev`/`pnpm start`는 `cross-env`로 `NODE_ENV`를 셸 독립적으로 주입한다. PowerShell·cmd·Bash·WSL 어디서든 그대로 동작. 포트는 3000 기본, 점유 시 3001~3019로 자동 fallback (`server/_core/index.ts:54–58`).

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

**Single-page app.** `client/src/pages/Home.tsx` is the entire product surface. It owns the 1첩 (인근매장 매출 조회 — 가맹사업법 정보공개서 양식) → 2첩 (목표 매출 입력, PRESETS 6 카드) → 3첩 (창업 비용 계산) consultation flow plus exports `calculateRevenue` and `CHANNELS` that the test suite consumes. 1첩 산출(`nearbyResult.maxEstimate/minEstimate`)이 2첩 PRESETS ⑤⑥에 자동 주입되며, `nearbyResult`가 null이면 ⑤⑥은 disabled. The `SharedReport` page (route `/report/:shareSlug`) renders a saved report; `NotFound.tsx` handles `/404` and the wouter fallback Route.

**1첩 인근매장 매출 조회** (`#nearby` 섹션): 가맹사업법 시행령 제9조 제3항 산식 구현. 가장 가까운 5개 매장(**같은 권역** — `seoul` / `gyeonggi` / `incheon` 3개 권역 완전 분리, 계약 1년+, 운영 180일+, 좌표 보유) → 1·5위 제외 → 2~4위 평균 매출 × (1 ± 0.259) = 최고/최저액. 권역 경계 인접 지역에서 권역이 다른 가까운 매장은 제외되며, 인천처럼 매장 풀이 작은 권역(10개)은 shortageFlag(<5) 가능성이 높음. 핵심 파일:
- `client/src/lib/nearby.ts` — `calculateNearbyDisclosure`, `detectRegion`, `haversineKm`, `annualizedSales` (순수함수, vitest node 통과). `Region = "seoul"|"gyeonggi"|"incheon"|"outside"`는 `regions.ts`에서 re-export.
- `client/src/components/NearbyMap.tsx` — Leaflet OSM 지도. **vitest node 환경 회피 위해 leaflet은 useEffect 안에서 dynamic import** (`window` 참조 방지). type-only `import type * as LeafletNS from "leaflet"`은 top-level OK. 익명 처리: 일반/제외 매장 핀은 tooltip 없이 위치만 표시. 매출 Top 5 핀만 letter(A~E) divIcon + `"매장 X"` tooltip. `String.fromCharCode(65 + idx)` 규칙으로 표(`disclosure-table`)의 가맹점명도 동일하게 `매장 A`~`매장 E`로 동기화 (실명 노출 금지).
- `client/src/data/stores.ts` — 70개 매장 (`name, region, address, contractDate, operatingDays2025, sales2025, lat, lng, isHall, isOperating`). 좌표는 빌드 타임 산출. `region` 필드(`"서울"|"경기"|"인천"`)와 `lib/nearby.ts`의 `detectRegionFromStore` 매핑은 일대일.
- `client/src/data/regions.geojson` + `client/src/data/regions.ts` — 서울/경인 권역 폴리곤. **자동 생성 파일** (`node scripts/build_regions_geojson.mjs`). 출처: southkorea-maps kostat 2018, RDP 단순화(epsilon=0.003) 적용. 코드에서는 `regions.ts`의 `REGIONS` import.
- `scripts/build_regions_geojson.mjs` — 17 시도 원본에서 서울 + 경인(경기∪인천) 추출·단순화 후 regions.geojson/ts 동시 출력.
- `scripts/geocode_stores.mjs` — 빌드 타임 매장 좌표 채우기. `--provider forge`(기본, FORGE_API_URL/KEY 환경변수) 또는 `--provider nominatim`(키 불필요, 1 req/sec). 도로명 단축 fallback(콤마·괄호 제거 → 도로명만 → 시/구) 4단계로 한국 상세주소 매칭 보강. 재실행 안전.
- 알려진 후속: ① Nominatim 매칭률 한계로 일부 매장 lat/lng=null 잔존 가능 — 실패한 매장은 수동 좌표 입력 또는 Kakao/VWorld 등 한국 친화 API 키 교체 ② Home.tsx의 `NATIONAL_MONTHLY_AVG`는 TODO 상수(현재 STORE_STATS.average와 동일).

**Router base path handling.** `client/src/App.tsx` derives `ROUTER_BASE` from `import.meta.env.BASE_URL` and **strips the trailing slash** via `.replace(/\/$/, "")` before passing to wouter's `<Router base>`. wouter requires no trailing slash even though Vite's `base` ends with one. When adding new routes, never hardcode the `/samcheop-v1-simulator` prefix — wouter handles it.

**Vite aliases** (mirrored in `tsconfig.json` and `vitest.config.ts`): `@` → `client/src`, `@shared` → `shared`, `@assets` → `attached_assets`. The Vite `root` is `client/`, not the repo root — static assets go in `client/public/`.

**Vite dev plugins.** `vitePluginManusDebugCollector` (defined inline in `vite.config.ts`) writes browser console/network/session replay logs to `.manus-logs/*.log` with 1MB rolling trim; `jsxLocPlugin` and `vitePluginManusRuntime` are Manus-specific. None are active in production builds.

## Tests

`vitest.config.ts` uses the **node environment** — there is no jsdom. Frontend tests assert against `Home.tsx` source text read via `readFileSync` (e.g. checking JSX strings, class names, formatting templates) rather than rendering components. When refactoring `Home.tsx`, expect to update these string-match assertions in `client/src/pages/Home.calculations.test.ts`.

Test inventory:
- `client/src/pages/Home.calculations.test.ts` — 공과금 2.2% + 푸드테크(22,000원) 고정비 합산, `CHANNELS` 내림차순/색상 유일성/합계, `fmtCompact·fmtPct` JSX 포맷, 1–3첩 섹션 순서, `validStores: 71` 통계 표기, 인사이트 그리드 single 컬럼(벤치마크 카드 hide), 채널 목록 grid 펼침, **PRESETS 6 카드(id/label/disabled) + 연환산천원→월매출원 변환식**. Windows CRLF 차단 위해 `readFileSync` 결과는 `.replace(/\r\n/g, "\n")` 적용.
- `client/src/lib/nearby.test.ts` — 정보공개서 예시값 회귀(avg 108,127 / max 136,132 / min 80,122 천원), 권역 판정(광화문→seoul, 수원역→gyeongin, 부산역→outside), 1년 미만/180일 미만 제외, shortageFlag(N<5), Top 5 거리 선정 (22 tests).
- `server/auth.logout.test.ts` — 로그아웃 시 세션 쿠키 클리어.
- `server/reports.router.test.ts` — `reports` 프로시저 4종 + 권한 검증.
- `server/ui.qa.test.ts` — Home.tsx UI 스모크.

Server tests run without a live DB by exercising the router directly.

## Conventions

- TypeScript strict, ESM (`"type": "module"`), `moduleResolution: bundler`, `allowImportingTsExtensions`.
- Prettier: semi=true, singleQuote=false, printWidth=80, arrowParens=avoid, endOfLine=lf.
- Currency formatting: `fmtWon` uses `Intl.NumberFormat("ko-KR", {currency:"KRW"})`; `fmtCompact` shows `만원` units. Reuse these in any new revenue display — don't hand-roll.
- Money values in business logic are stored as raw KRW numbers (no cents); margins/ratios are decimals 0–1 and rendered with `fmtPct`.
- All shared constants between client and server live in `shared/const.ts`. `COOKIE_NAME`, `UNAUTHED_ERR_MSG`, `NOT_ADMIN_ERR_MSG` must stay identical on both sides — the client matches on string equality.
- Korean is the product language. UI copy, comments tied to business rules, and commit messages are typically Korean; identifiers and APIs stay English.

## Things to know before changing calculations

- The default `monthlySales` (32,344,100원) and `partTime` (2.5명) are derived from the Excel workbook, not arbitrary. Cross-reference `v1_excel_config_spec.md` §3 before tuning.
- Channel mix in `CHANNELS` must sum to ~100% and stay sorted descending by `ratio` — `Home.calculations.test.ts` enforces both. Each channel needs a unique color (also enforced).
- `logistics`(식자재+포장)는 `monthlySales × 0.40`으로 단일 비율 적용. 식자재 36% / 포장 4%로 분리되어 있지만 합산 단일 곱셈이라 두 값을 따로 조정하려면 `calculateRevenue` 시그니처부터 바꿔야 한다.
- 고정비 = 공과금(`monthlySales × 2.2%`) + `inputs.rent` + 푸드테크 22,000원 정액. `result.utilities`는 공과금만 가리키며 별도 입력 필드 없음. 안내 문구도 "공과금 = 월매출 2.2% + 푸드테크"로 통일.
- **로열티 110,000원은 고정비와 분리된 별도 라인** (`revenue.royalty`). 손익표·비용 막대 차트 모두 별도 노출이며 `fixed`에 합산하지 않음. `totalCost = logistics + platform + labor + fixed + royalty`이고 `profitAt` BEP 함수에서도 동일 차감.
- Platform fee comes from `calculatePlatformFee` over all 13 `CHANNELS` (배달/포장/홀 카테고리). **산식은 26년 Excel 「목표매출 산정자료」 F37~F47 셀과 정합** — 배민(가게배달)은 퀵비 16.5% + 중개·결제 + 주문당 배달비(VAT), 배민원/요기요/쿠팡이츠는 중개·결제 + 주문당 배달비 모두 VAT(×1.1), 포장 5채널은 0원, 카드매출만 0.005% 정액. 채널 추가/수수료 조정 시 `v1_excel_config_spec.md` §3·§6과 `scripts/validate_simulator_config.mjs`도 같이 갱신.
- BEP is found by binary search up to ₩70,000,000 — bump the bound if you change the cost structure to allow higher break-even.
- 1첩 산식의 ±25.9%는 시행령 제9조 제3항 "최고/최저 1.7배 상한" → 평균 기준 편차율로 고정. avg×1.259 / avg×0.741. 검증값: `client/src/lib/nearby.test.ts`의 정보공개서 예시 회귀.

## **관련 문서 최신화**[중요]
- 메인 폴더와 각 폴더에 있는 AGENTS.md 는 코드가 수정, 변경, 추가, 신규가 생겼을 때 최신화 또는 신규 AGENTS.md 를 만든다.
- AGENTS.md 와 마찬가지로 CLAUDE.md 를 최신화 한다. CLAUDE.md 는 250줄 이하로 효율적인 문맥으로 관리한다. 
- CLAUDE.md 는 사용자가 아닌 오직 클로드 코드 만을 위한 파일이다. 클로드 코드 가 참고하기 편하게 작성한다. 
- 사용자가 세션을 종료하겠다고 하면 해당 세션에서 필요하다 판단되는 것들을 memory 에 기억한다.
- 프론트엔드 디자인 관련해서는 DESIGN.md 를 참조하며, 디자인이 추가되거나 바뀌면 항상 최신화 한다.

## Deployment (GitHub Pages, static)

- 워크플로: `.github/workflows/deploy-pages.yml` — `main` push/`workflow_dispatch` 트리거. `pnpm build` → `dist/public/` 업로드. SPA fallback `404.html`은 빌드 후 워크플로에서 복사.
- Base path: `vite.config.ts`의 `base: "/samcheop-v1-simulator/"`. 자산은 `/samcheop-v1-simulator/assets/...`로 빌드됨. 레포 rename 시 동시 갱신 필수.
- `client/index.html` 의 `%VITE_ANALYTICS_*%` 분석 스크립트는 정적 배포에서 빈 값 치환으로 404 유발 → 제거 상태.
- 정적 배포에서 동작 안 함: OAuth, tRPC API (`reports.*`), `/manus-storage/*`. `client/src/pages/Home.tsx`(메인 시뮬레이터)는 백엔드 의존 0 → 정상 동작.
- 공개 URL: `https://potato-chocolate.github.io/samcheop-v1-simulator/`.
