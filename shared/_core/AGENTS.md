<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# _core

## Purpose
Shared cross-cutting primitives that don't fit in a flat constants file. Currently scoped to the HTTP error hierarchy used by server route handlers and recognized by the tRPC error formatter.

## Key Files
| File | Description |
|------|-------------|
| `errors.ts` | `HttpError` base class plus convenience constructors `BadRequestError(400)`, `UnauthorizedError(401)`, `ForbiddenError(403)`, `NotFoundError(404)` |

## For AI Agents

### Working In This Directory
- Keep this folder dependency-free — anything imported here is bundled into both client and server. The error classes already follow this rule (zero imports).
- When adding a new shared primitive, ask first whether it really crosses the network boundary. If it's only used on the server, put it under `server/`; only put it here when both sides will import it.
- Error subclasses are matched on `instanceof HttpError` and on `statusCode`. Don't change `statusCode` types or rename the class without searching usages in `server/_core/` first.

### Testing Requirements
- None directly. Behavior is verified via the route handlers that throw these errors.

## Dependencies

### Internal
- None.

### External
- None.

<!-- MANUAL: -->
