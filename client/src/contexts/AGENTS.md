<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-12 | Updated: 2026-05-12 -->

# contexts

## Purpose
React context providers exposing app-wide state. Currently scoped to theme management; mounted from `App.tsx`.

## Key Files
| File | Description |
|------|-------------|
| `ThemeContext.tsx` | `ThemeProvider({ defaultTheme, switchable })` and `useTheme()`. Toggles the `.dark` class on `document.documentElement`. When `switchable=true` it persists the theme in `localStorage["theme"]`; when `false` (the simulator's default), `toggleTheme` is `undefined` and no localStorage writes happen |

## For AI Agents

### Working In This Directory
- **The simulator runs `defaultTheme="light"` and is non-switchable.** `App.tsx` mounts `<ThemeProvider defaultTheme="light">` without passing `switchable`. The branded red/yellow/cream palette in `index.css` is light-only — adding a dark mode requires a redesign pass, not just toggling this flag.
- `useTheme()` throws if used outside the provider; this is intentional. Keep the error message because it's the only signal you'll get during development.
- If a new context is needed, prefer a separate file per context here and a single composed provider in `App.tsx`. Don't fold multiple unrelated contexts into one provider.

### Testing Requirements
- No tests. Visual verification only.

### Common Patterns
- Provider + hook in the same file (`ThemeProvider`, `useTheme`).

## Dependencies

### Internal
- Consumed only by `App.tsx` at present; `useTheme()` is available to any descendant.

### External
- React 19 (`createContext`, `useState`, `useEffect`, `useContext`)

<!-- MANUAL: -->
