<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# v1_extracted

## Purpose
Human-readable Markdown dumps of the four logical sheets that were extracted from the original v1 삼첩분식 Excel workbooks (`v1_workbook_structure.json` is the raw structural snapshot at the repo root). These files preserve the source numbers behind every constant in the simulator so changes can be audited back to a row in the spreadsheet.

## Key Files
| File | Description |
|------|-------------|
| `v1_goal_summary.md` | "목표매출 산정서 → 목표" sheet — top-line target revenue and margin summary used to seed the simulator's default `monthlySales` |
| `v1_revenue_source.md` | "목표매출 산정자료" sheet — channel mix percentages, platform fee formulas, labor and fixed-cost breakdowns. Source of `CHANNELS` in `client/src/pages/Home.tsx` |
| `v1_opening_costs.md` | "예상개설비용" sheet — line items for HQ fees, interior per-pyeong, signage, kitchen, hall furniture. Source of the opening-cost CONFIG |
| `v1_capital_area_stores.md` | "수도권 매장" sheet — 55-store benchmark dataset used for the `BENCHMARK_STORES` and `STORE_STATS` constants |

## For AI Agents

### Working In This Directory
- **This is the audit trail for calculation constants. Treat it as read-only.** If a number in the simulator no longer matches what's here, either update the simulator or document the deliberate override in `../v1_excel_config_spec.md` — never silently change these markdown files to match a code change.
- When the user provides a new Excel revision, regenerate these files from the new workbook (manual export is acceptable) and bump the constants in `../client/src/pages/Home.tsx` + `../scripts/validate_simulator_config.mjs` in the same commit.
- The interpretive layer (which Excel value maps to which CONFIG key, which assumptions are imposed) lives in `../v1_excel_config_spec.md`, not here.

### Testing Requirements
- N/A — pure data. Cross-checked by running `node ../scripts/validate_simulator_config.mjs` and comparing the output to the expected numbers in §6 of `../v1_excel_config_spec.md`.

### Common Patterns
- One file per logical Excel sheet, naming pattern `v1_<sheet_topic>.md`.

## Dependencies

### Internal
- `../v1_excel_config_spec.md` — interprets these dumps into CONFIG values
- `../v1_workbook_structure.json` — raw machine-readable structural snapshot
- `../client/src/pages/Home.tsx` — runtime consumer (constants only, not the markdown)

### External
- None.

<!-- MANUAL: -->
