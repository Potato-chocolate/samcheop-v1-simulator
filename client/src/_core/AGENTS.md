<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# _core

## Purpose
Manus template-provided client primitives. By convention `_core/` folders carry boilerplate that ships with the template and is rarely customized by feature work — auth wiring, SDK glue, and similar plumbing. Application-specific code belongs in sibling folders (`hooks/`, `lib/`, etc.).

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `hooks/` | Template auth hook(s) — `useAuth` (see `hooks/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Treat this folder as **template scaffolding**. Prefer building new client behavior in `src/hooks/`, `src/lib/`, or `src/components/` rather than expanding `_core/`.
- Auth-related primitives (the `useAuth` hook here, `manusTypes`/SDK on the server) follow the same `_core` convention on both sides — they are deliberately co-located so they can be updated together when the Manus template upstream changes.

### Testing Requirements
- None directly. Verified transitively through the auth tests under `../../../server/`.

## Dependencies

### Internal
- `../lib/trpc.ts`, `../const.ts` — consumed by the hooks here

### External
- `@trpc/client` (`TRPCClientError` shape checks)

<!-- MANUAL: -->
