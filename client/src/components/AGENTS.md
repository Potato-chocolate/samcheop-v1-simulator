<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# components

## Purpose
Application-level React components plus the shadcn/ui primitive library. Application components (PascalCase `.tsx` files at this level) are template/feature components shipped with the Manus scaffold — most are unused by the current 삼첩분식 simulator surface (`pages/Home.tsx` builds its own layout from Tailwind primitives). The `ui/` subdirectory holds the shadcn registry components, which are actively used throughout.

## Key Files
| File | Description |
|------|-------------|
| `ErrorBoundary.tsx` | Class component used by `App.tsx`. Shows a stack trace and "Reload Page" button when any descendant throws |
| `AIChatBox.tsx` | Manus template AI chat widget — not mounted by the simulator today |
| `DashboardLayout.tsx`, `DashboardLayoutSkeleton.tsx` | Template dashboard shells — not used by Home |
| `ManusDialog.tsx` | Manus-branded dialog wrapper |
| `Map.tsx` | Google Maps embed component (relies on `@types/google.maps`) — reserved for the "인근매장 매출 조회" feature listed as 개발중 in the 1첩 step |

## Subdirectories
| Directory | Purpose |
|-----------|---------|
| `ui/` | shadcn/ui primitives — buttons, dialogs, inputs, tables, sidebars, charts (see `ui/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- **Don't delete the unused template components on sight.** `Map.tsx` is the planned mount point for the 1첩 "인근매장 매출 조회" feature (개발중). The dashboard / chat scaffolds are similarly held in reserve. Confirm with the user before removing.
- New application components belong at this directory level; new primitives belong under `ui/`. Don't mix them.
- `ErrorBoundary` is the only globally mounted component from this folder. It must remain a class component (React error-boundary contract).
- Avoid colocating component-scoped styles. The project uses Tailwind v4 + a single `index.css`; per-component CSS modules are not configured.

### Testing Requirements
- No component tests exist today (tests run under the node environment, no jsdom). When adding behavioral logic, extract a pure helper and unit-test that — mirror the `Home.tsx` / `Home.calculations.test.ts` split.

### Common Patterns
- `import { cn } from "@/lib/utils"` for conditional class names.
- Lucide icons imported by name (`import { AlertTriangle } from "lucide-react"`).

## Dependencies

### Internal
- `@/lib/utils` (`cn`)
- `@/components/ui/*` (composed by application components like `DashboardLayout`)

### External
- `lucide-react`, all `@radix-ui/*` packages (consumed by `ui/`)
- `@types/google.maps` (Map.tsx)

<!-- MANUAL: -->
