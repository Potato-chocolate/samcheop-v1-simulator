<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# scripts

## Purpose
Standalone Node scripts that complement the build but are not part of the runtime bundle. They are run on demand from the repo root (e.g. `node scripts/validate_simulator_config.mjs`) and write their output as committed artifacts next to the source data.

## Key Files
| File | Description |
|------|-------------|
| `validate_simulator_config.mjs` | Recomputes the v1 CONFIG calculations (channel mix, revenue/cost split, BEP via binary search) with the same constants used in `client/src/pages/Home.tsx` and writes the result to `../simulator_config_validation.json`. Run after any change to the calculation defaults to keep the committed validation artifact in sync |

## For AI Agents

### Working In This Directory
- Scripts are intentionally ESM (`.mjs`) — no TS, no bundler. They must run with bare `node` and import nothing from the rest of the codebase. Duplicate the constants if needed and document the source.
- If a script's output is consumed downstream (the validation JSON, the CONFIG spec markdown), regenerate and commit it in the same change that updates the source constants.
- Don't move the legacy `*.py` helpers in the repo root here; they were one-shot tools and live at the top level for historical clarity.

### Testing Requirements
- None. Scripts are validated by the artifact they produce (e.g. open `simulator_config_validation.json` and confirm the numbers match `v1_excel_config_spec.md` §6).

### Common Patterns
- Each script is self-contained: constants are duplicated from the React code rather than imported, so the script can be diffed against the source as an independent check.

## Dependencies

### Internal
- Indirectly: shares constants with `../client/src/pages/Home.tsx`.

### External
- Node ≥18 (uses native `fs/promises`, `Intl`, `crypto`).

<!-- MANUAL: -->
