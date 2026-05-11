<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# lib

## Purpose
Cross-cutting client utilities consumed throughout the source tree. Currently the typed tRPC client and the `cn()` Tailwind class merger.

## Key Files
| File | Description |
|------|-------------|
| `trpc.ts` | `export const trpc = createTRPCReact<AppRouter>()`. **Type-only import** of `AppRouter` from `../../../server/routers` — this is the single point at which the client's tRPC types are bound to the server's router shape |
| `utils.ts` | `cn(...inputs)` — `twMerge(clsx(inputs))` for conditional Tailwind class composition |

## For AI Agents

### Working In This Directory
- **Do not import from `server/` outside of `trpc.ts`'s type-only import.** Pulling runtime code from the server side into the client bundle is a silent bundling failure waiting to happen (server-only modules like `mysql2` or `fs` will explode at runtime). The `import type` form is intentional.
- `cn` is the only sanctioned class-merging utility — don't reach for `classnames`, `clsx` directly, or string concatenation in JSX. `twMerge` correctly resolves conflicting Tailwind classes (e.g. `p-2` vs `p-4`), which raw `clsx` would not.
- Keep this folder shallow. Anything domain-specific (calculations, formatters) belongs near its consumer, not here.

### Testing Requirements
- None. Both files are trivial pass-throughs whose behavior is covered by integration use in components.

### Common Patterns
- Single-export modules, named exports only.

## Dependencies

### Internal
- `../../../server/routers` — `AppRouter` type (compile-time only)

### External
- `@trpc/react-query`, `clsx`, `tailwind-merge`

<!-- MANUAL: -->
