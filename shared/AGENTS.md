<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# shared

## Purpose
Constants and types imported by **both** the client and the server. Anything that crosses the network boundary in either direction (error message strings the client matches on, cookie names) lives here and is aliased to `@shared/*`.

## Key Files
| File | Description |
|------|-------------|
| `const.ts` | `COOKIE_NAME = "app_session_id"`, `UNAUTHED_ERR_MSG = "Please login (10001)"`, `NOT_ADMIN_ERR_MSG = "(10002)"`, `ONE_YEAR_MS`, `AXIOS_TIMEOUT_MS` |
| `types.ts` | Cross-cutting TypeScript types shared between client and server |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `_core/` | Shared error class hierarchy (see `_core/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- **Error message strings are part of an API contract.** The client (`client/src/main.tsx`) matches `error.message === UNAUTHED_ERR_MSG` exactly to trigger a login redirect. Don't rename the constant without updating both sides simultaneously.
- Keep this directory dependency-free where possible — anything imported here gets pulled into both the client bundle and the server bundle.

### Testing Requirements
- No tests of its own. Validation happens via the consumers' test suites.

### Common Patterns
- Re-export pattern: `client/src/const.ts` re-exports a subset of `@shared/const` so the client side has one stable import name.

## Dependencies

### Internal
- None.

### External
- None.

<!-- MANUAL: -->
