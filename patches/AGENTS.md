<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# patches

## Purpose
Holds dependency patch files consumed by pnpm's `patchedDependencies` mechanism. pnpm applies these on every `pnpm install`, so they must remain valid for the version pinned in `package.json`.

## Key Files
| File | Description |
|------|-------------|
| `wouter@3.7.1.patch` | Pinned patch for the `wouter` router at v3.7.1, referenced from `package.json` under `pnpm.patchedDependencies` |

## For AI Agents

### Working In This Directory
- **Bumping a patched dependency requires updating the patch.** Run `pnpm patch wouter@<new-version>` to refresh the patch against the new source, save the resulting file here with the matching `@version` suffix, and update the key in `package.json`.
- Never edit `.patch` files by hand — regenerate via `pnpm patch` so context lines and hashes stay correct.

### Testing Requirements
- After regenerating a patch, run `pnpm install` to confirm pnpm applies it cleanly, then `pnpm test` to catch behavioral drift.

### Common Patterns
- File naming convention: `<package-name>@<exact-version>.patch`. The `@<version>` portion is meaningful — pnpm uses it to refuse the patch when the package version changes.

## Dependencies

### Internal
- `../package.json` — declares which patches are active under `pnpm.patchedDependencies`.

### External
- pnpm itself manages the patch lifecycle.

<!-- MANUAL: -->
