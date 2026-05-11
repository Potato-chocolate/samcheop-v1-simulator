<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# public

## Purpose
Static assets served verbatim by Vite at the site root and copied to `dist/public/` during build. Vite does not transform anything here; URLs are stable and predictable (`/__manus__/debug-collector.js`, `/favicon.ico`, etc.).

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `__manus__/` | Runtime artifacts produced by `vite-plugin-manus-runtime` and the in-repo debug collector. Includes `debug-collector.js` (injected as a `<script>` in dev) and the gitignored `version.json` |

## For AI Agents

### Working In This Directory
- Files placed here are publicly accessible — never put secrets, credentials, or `.env` snapshots in this tree.
- Reference assets in client code with absolute paths starting at `/` (e.g. `/logo.svg`), not relative imports — they are not bundled.
- The `__manus__/` subdirectory is owned by the Manus toolchain (Vite plugin). Do not hand-edit files there; if you need new debug behavior, modify the inline `vitePluginManusDebugCollector` in `../../vite.config.ts`.

### Testing Requirements
- None. Static assets are exercised by browser tests / manual QA against the dev server.

### Common Patterns
- This directory should stay flat and small. Anything generated (build outputs, screenshots, captures) belongs outside the source tree.

## Dependencies

### Internal
- `../../vite.config.ts` — `publicDir` points at this folder; the debug-collector plugin serves `/__manus__/logs` as an in-dev sink

### External
- `vite-plugin-manus-runtime` owns most files under `__manus__/`

<!-- MANUAL: -->
