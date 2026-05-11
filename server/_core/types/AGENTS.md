<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# types

## Purpose
Server-side ambient and structural type declarations. Holds (a) a hand-written ambient module declaration for `cookie` (because the library's ESM types don't match the import shape used here) and (b) the auto-generated TypeScript DTOs for the Manus identity-service protobuf API consumed by `sdk.ts`.

## Key Files
| File | Description |
|------|-------------|
| `cookie.d.ts` | Ambient `declare module "cookie"` declaring the `parse(str, options?)` signature that `sdk.ts` uses to read `req.headers.cookie`. Hand-written shim — keep it minimal |
| `manusTypes.ts` | Auto-generated structural types for the Manus WebDev Auth service: `ExchangeTokenRequest`/`Response`, `GetUserInfoRequest`/`Response`, `GetUserInfoWithJwtRequest`/`Response`, `AuthorizeRequest`/`Response`. **Do not hand-edit** — regenerated from upstream protobuf definitions |

## For AI Agents

### Working In This Directory
- `manusTypes.ts` is regenerated from upstream protobufs. Treat it as read-only — if a field is missing, refresh from upstream rather than patching the file. The header comment shows the last generation timestamp.
- `cookie.d.ts` exists because the runtime `cookie` package's TS types don't expose `parse(str, options?)` in a form usable here. Keep it as a small targeted declaration; do not turn it into a full re-typing of the library.
- These files are pure type-level — they must compile under `tsc --noEmit` (`pnpm check`) but produce no runtime output.

### Testing Requirements
- None directly. Errors surface from `pnpm check` and from `sdk.ts`'s usage of the typed responses.

## Dependencies

### Internal
- Consumed by `../sdk.ts` (`manusTypes`) and `../sdk.ts` (`cookie` module declaration)

### External
- `cookie` (runtime package whose types this file augments)

<!-- MANUAL: -->
