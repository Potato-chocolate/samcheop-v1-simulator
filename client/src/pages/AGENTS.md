<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 (Excel 26.03 원본 정합 + 로열티 별도 라인) -->

# pages

## Purpose
wouter-routed top-level views. Each file is a leaf React component reachable from `App.tsx`'s `<Switch>` and represents an entire screen of the simulator. `Home.tsx` is the product surface — almost all calculation logic, channel data, and consultation UI lives here.

## Key Files
| File | Description |
|------|-------------|
| `Home.tsx` | **The product.** Renders the 1첩 (인근매장 매출 조회 — 개발중) → 2첩 (목표 매출 입력) → 3첩 (창업 비용 계산) flow. Defines and **exports** `calculateRevenue(inputs)`, `CHANNELS`, and supporting constants (`STORE_STATS`, `BENCHMARK_STORES`, `ASSETS`, defaults). Owns input state, `useMemo` calculations, the receipt-style P&L, the channel stacked bar, the benchmark table, and the PDF print layout |
| `Home.calculations.test.ts` | Vitest suite. Mixes pure-function assertions (`calculateRevenue`, `CHANNELS` ordering, color uniqueness) with **source-string assertions** that read `Home.tsx`/`index.css` via `readFileSync` to verify specific JSX strings remain present (channel mapping, cost-bar format, removed cards, etc.) |
| `SharedReport.tsx` | Read-only public page rendered at `/report/:slug`. Calls `trpc.reports.getBySlug` with `retry: false`, shows loading/error states, and renders the saved snapshot with the same `fmtWon`/`fmtCompact`/`fmtPct` formatting as Home |
| `NotFound.tsx` | wouter fallback view for unknown routes |
| `ComponentShowcase.tsx` | shadcn/ui component preview page (not wired into the router by default) |

## For AI Agents

### Working In This Directory
- **`Home.tsx` is the single biggest fragile surface.** The companion test asserts against literal substrings in the source — e.g. `"{fmtCompact(item.value)} · {fmtPct(item.value / revenue.monthlySales)}"`, `'className="insight-grid insight-grid--two"'`, `'<div className="stacked-bar" aria-label="채널 매출 믹스">\n                {CHANNELS.map((channel) => ('`. Renaming a class, reordering a `useMemo`, or reformatting JSX whitespace can break tests without changing behavior. Either preserve the exact string or update the test in the same change.
- `calculateRevenue` is the only function `Home.tsx` exposes for direct unit testing. Keep it pure (no React hooks inside), no side effects, returns the full breakdown (revenue, utilities, fixed, **royalty**, labor, platform, BEP). 로열티는 `fixed`에 합산하지 않은 별도 필드. Existing callers depend on the field names — see the Zod `revenueSummarySchema` on the server.
- Platform fee 산식은 26년 Excel 「목표매출 산정자료」 F37~F47 셀과 1:1 정합. 산식 수정 시 `v1_excel_config_spec.md` §3·§6, `scripts/validate_simulator_config.mjs`, `Home.calculations.test.ts`의 채널별 fee 회귀 4건도 함께 갱신.
- BEP search uses binary search up to ₩70,000,000. Raise the upper bound if a structural cost change pushes break-even higher; otherwise BEP silently saturates.
- `CHANNELS` must remain sorted descending by `ratio`, sum ~100%, and each have a unique `#rrggbb` color. The test enforces all three.
- `SharedReport` parses the slug from `window.location.pathname.split("/").filter(Boolean).at(-1)` rather than wouter params. If you wire the route through `<Route path="/report/:slug">`, update both sides.

### Testing Requirements
- Run `pnpm test client/src/pages/Home.calculations.test.ts` after **any** edit to `Home.tsx`. The suite catches both numerical regressions and source-shape changes.
- Visually verify in dev (`pnpm dev`) — type assertions can't catch broken Tailwind classes or print-only CSS.

### Common Patterns
- Currency: triple of `fmtWon` / `fmtCompact` / `fmtPct` is defined per page (Home, SharedReport, server) — keep formatting consistent across all three.
- Heavy `useMemo` blocks for every derived number. Don't refactor into per-field memos lightly; the existing structure keeps the render pure across all sliders.

## Dependencies

### Internal
- `@/lib/trpc` (SharedReport, save dialog on Home), `@/components/ui/*` for inputs and dialogs
- `@/lib/utils` (`cn`)

### External
- `wouter` (`<Link>`), `sonner` (toast), `lucide-react` (icons), `recharts` is *not* used here — Home renders the channel chart with hand-built div bars

<!-- MANUAL: -->
