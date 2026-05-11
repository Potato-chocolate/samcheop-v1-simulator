<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# hooks

## Purpose
Generic, application-agnostic custom hooks. Auth-flow hooks (`useAuth`) live separately under `_core/hooks/`; this folder is for input/UX/utility hooks that don't depend on the Manus template.

## Key Files
| File | Description |
|------|-------------|
| `usePersistFn.ts` | "Persistent callback" — wraps a function in a `useRef` so referents stay stable across re-renders, similar to a lightweight `useCallback` with always-stable identity. Used by `useComposition` to avoid re-binding listeners |
| `useComposition.ts` | IME composition guard for `<input>` / `<textarea>`. Returns `onCompositionStart`/`onCompositionEnd`/`onKeyDown`/`isComposing()` — used to swallow Escape / Enter while a Korean (or other CJK/IME) composition is in flight. Includes a Safari-specific double-`setTimeout` shim because `compositionEnd` can fire before `onKeyDown` there |
| `useMobile.tsx` | `useIsMobile()` — returns true under a 768px breakpoint via `matchMedia` |

## For AI Agents

### Working In This Directory
- **Korean input safety: use `useComposition` on any text input that triggers an action on Enter.** Without it, the Enter key that confirms a Hangul composition will also fire the submit/search handler, producing duplicate or premature commits. The hook is correct as-is; reuse it, don't reimplement.
- `usePersistFn` is deliberately a thinner abstraction than `useCallback`. Don't replace it with `useCallback` for "consistency" — it gives a single stable reference across the component lifetime, which `useCallback` cannot guarantee.
- The 768px breakpoint in `useMobile` matches the implicit Tailwind `md:` threshold. If you change Tailwind's `screens` config, update this constant too.

### Testing Requirements
- No tests. These hooks are exercised by the components that use them.

### Common Patterns
- Naming: `use*` prefix, default export-free (named exports only).
- Each hook in its own file; one hook per file.

## Dependencies

### Internal
- `useComposition.ts` → `usePersistFn.ts`

### External
- React 19 only.

<!-- MANUAL: -->
