<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# references

## Purpose
Platform / runtime reference documentation that informs how server-side features should be implemented. These are not auto-generated and not enforced by code; they describe the Manus/Forge hosting contract that the codebase has to honor.

## Key Files
| File | Description |
|------|-------------|
| `periodic-updates.md` | Rules for adding any scheduled/cron behavior. Forbids in-process timers (`setInterval`, `node-cron`). Distinguishes Heartbeat HTTP cron (POST to `/api/scheduled/*`) from AGENT cron (spawns isolated Manus session). All scheduled endpoints must live under `/api/scheduled/`, be idempotent, and authenticate via `sdk.authenticateRequest` |

## For AI Agents

### Working In This Directory
- **Read `periodic-updates.md` before adding any scheduled feature.** The hosting platform (Cloud Run) terminates idle instances — in-process schedulers will not survive and `setInterval` is explicitly forbidden.
- Treat the docs in this folder as constraints, not suggestions. They reflect the production runtime behavior; deviating means the feature won't work after deploy.
- If you discover an additional platform rule worth recording, add a new markdown file here (and mention it in the root `AGENTS.md`) rather than scattering it across implementation files.

### Testing Requirements
- N/A — these are reference documents.

### Common Patterns
- Each document focuses on a single platform concern (scheduling, storage, auth, etc.) and lists hard requirements before optional ergonomics.

## Dependencies

### Internal
- None at runtime; consumed by humans/agents authoring server code.

### External
- Documents the Manus/Forge hosting platform contract.

<!-- MANUAL: -->
