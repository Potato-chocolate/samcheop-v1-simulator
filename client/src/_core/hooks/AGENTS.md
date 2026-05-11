<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# hooks

## Purpose
Client auth hooks shipped with the Manus template. Lives under `_core/hooks/` (separate from the generic `src/hooks/` tree) so template upgrades touch only this directory.

## Key Files
| File | Description |
|------|-------------|
| `useAuth.ts` | `useAuth({ redirectOnUnauthenticated?, redirectPath? })`. Wraps `trpc.auth.me.useQuery` (with `retry: false`, no refetch on focus) and `trpc.auth.logout.useMutation`. Exposes `{ user, loading, error, isAuthenticated, refresh, logout }`. Side-effects: writes the latest `auth.me` data to `localStorage["manus-runtime-user-info"]` and optionally redirects to a login URL when unauthenticated |

## For AI Agents

### Working In This Directory
- **The simulator runs anonymously by default.** Don't enable `redirectOnUnauthenticated` for routes that should be reachable without login (the 1첩/2첩/3첩 flow). Reserve it for screens that genuinely require a signed-in user (a "my saved reports" list, for example).
- `useAuth` writes to `localStorage["manus-runtime-user-info"]` inside `useMemo`. That key is read by Manus dev tooling — don't rename it.
- The hook is silent about real auth errors during logout (it swallows `TRPCClientError` with `data.code === "UNAUTHORIZED"`) and intentionally still clears the local query cache in the `finally` block. Preserve that pattern when extending.
- Don't fall back to global state libraries; co-locate any new auth derivative as another hook in this folder so the auth contract stays in one place.

### Testing Requirements
- No client-side tests. Behavior is covered by `server/auth.logout.test.ts` exercising the same procedure end-to-end.

## Dependencies

### Internal
- `@/lib/trpc`, `@/const` (`getLoginUrl`)

### External
- `@trpc/client` (`TRPCClientError` shape)

<!-- MANUAL: -->
