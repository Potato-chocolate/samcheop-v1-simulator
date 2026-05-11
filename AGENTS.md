<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# samcheop-v1-simulator

## Purpose
삼첩분식(Samcheop Bunsik) 프랜차이즈 상담용 시뮬레이터. v1 Excel 워크북에서 추출한 매출/손익/개설비용 산식을 React+Express+tRPC 풀스택으로 옮긴 단일 페이지 도구입니다. 상담사가 후보자에게 보여줄 손익 시나리오, 개설비용, 수도권 55개 매장 벤치마크를 한 화면에서 비교하고 결과 리포트를 저장·공유할 수 있도록 합니다. 계산 상수의 출처는 `v1_excel_config_spec.md`이며, 실제 가맹 계약·견적·수익 보장을 의미하지 않는 상담 추정 도구입니다.

## Key Files
| File | Description |
|------|-------------|
| `package.json` | pnpm + ESM, scripts: `dev`, `build`, `start`, `check`, `test`, `format`, `db:push` |
| `tsconfig.json` | strict TS, `moduleResolution: bundler`, aliases `@/* @shared/*` |
| `vite.config.ts` | Vite client build with custom `manus-debug-collector` plugin writing `.manus-logs/*.log` |
| `vitest.config.ts` | node environment; test glob covers `server/**` and `client/src/**/*.test.ts` |
| `drizzle.config.ts` | MySQL dialect; schema at `drizzle/schema.ts`, migrations at `drizzle/` |
| `components.json` | shadcn/ui registry config |
| `.prettierrc` | semi=true, singleQuote=false, printWidth=80, arrowParens=avoid |
| `CLAUDE.md` | Claude Code agent guidance (architecture, commands, gotchas) |
| `v1_excel_config_spec.md` | Authoritative spec for calculation constants and Excel→CONFIG mapping |
| `simulator_config_validation.json` | Output of `scripts/validate_simulator_config.mjs` — recompute when constants change |
| `todo.md` | Historical task log for the v1 buildout |
| `brand_*.md`, `implementation_*.md`, `qa_*.md`, `*_notes.md`, `ideas.md` | Brand research, QA findings, design notes — read-only references |
| `apply_qa_simplification.py`, `patch_home_structure.py`, `generate_store_snippet.py`, `inspect_store_counts.py`, `scripts_extract_top10.py` | One-shot Python helpers used during the initial Excel→React migration |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `client/` | Vite React SPA root (see `client/AGENTS.md`) |
| `server/` | Express + tRPC backend (see `server/AGENTS.md`) |
| `shared/` | Cross-cutting constants and types (see `shared/AGENTS.md`) |
| `drizzle/` | MySQL schema and migrations (see `drizzle/AGENTS.md`) |
| `scripts/` | Validation / utility Node scripts (see `scripts/AGENTS.md`) |
| `patches/` | pnpm `patchedDependencies` payloads (see `patches/AGENTS.md`) |
| `references/` | External / vendor reference docs (see `references/AGENTS.md`) |
| `v1_extracted/` | Markdown dumps from the v1 Excel workbooks (see `v1_extracted/AGENTS.md`) |
| `.github/workflows/` | CI/CD — currently `deploy-pages.yml` (GitHub Pages 정적 배포, `main` push 트리거) |

## For AI Agents

### Working In This Directory
- **Always run `pnpm test` and `pnpm build` after touching `client/src/pages/Home.tsx` or `server/routers.ts`** — Home.tsx is asserted via source-string matching, and routers.ts changes ripple to the client's TS types.
- Don't introduce a new top-level docs/notes file unless the user asks; the repo root already carries the brand/qa/notes corpus.
- Keep calculation defaults in sync with `v1_excel_config_spec.md`. If you change a constant, also rerun `node scripts/validate_simulator_config.mjs` and commit the resulting `simulator_config_validation.json`.
- The one-shot `*.py` helpers in the root are historical artifacts. Don't extend them; write a new fit-for-purpose script under `scripts/` instead.

### Testing Requirements
- `pnpm test` runs the full vitest suite under the node environment. There is no jsdom — frontend tests read source files via `readFileSync` and assert string presence.
- Single test: `pnpm test client/src/pages/Home.calculations.test.ts` or `pnpm test -- -t "<title regex>"`.
- `pnpm check` is the TypeScript-only verification (no emit).

### Common Patterns
- Korean is the product language; identifiers stay English. Strings shown to users — labels, error toasts, report HTML — are Korean.
- Currency: `fmtWon` (KRW with `Intl.NumberFormat("ko-KR")`) and `fmtCompact` (만원 단위). Always reuse these; never reimplement formatting.
- All money in business logic is raw KRW number, ratios are 0–1 decimals.

## Dependencies

### External
- **React 19** + `wouter` router, TanStack Query v5
- **tRPC 11** with `superjson` transformer, batched HTTP link
- **Express 4** as the HTTP listener
- **drizzle-orm** + `mysql2` driver, `drizzle-kit` for migrations
- **Vite 7** for client build + dev middleware via `setupVite`
- **esbuild** to bundle the server to `dist/`
- **Tailwind CSS v4** via `@tailwindcss/vite`; shadcn/ui Radix primitives
- **vitest** for tests (no jsdom)
- AWS S3 client (`@aws-sdk/client-s3`, `s3-request-presigner`) — currently invoked via Forge presign rather than direct
- Manus toolchain: `@builder.io/vite-plugin-jsx-loc`, `vite-plugin-manus-runtime`

<!-- MANUAL: -->
