# workout-tracker

A Vite + TypeScript workout tracking app.

## Agent skills

### Issue tracker

GitHub Issues — tracked in the repo's GitHub Issues tab. See `docs/agents/issue-tracker.md`.

### Code host

GitHub — code lives at `github.com/jamwest/workout-tracker`. See `docs/agents/code-host.md`.

### Workflow conventions

Conventional Commits, `feat/<slug>` / `fix/<slug>` branches, squash merge. See `docs/agents/workflow.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## UI conventions

All UI elements **must** use components from `src/components/ui/`. Never use bare HTML elements (`<button>`, `<input>`, `<dialog>`) directly in page or feature components.

If a needed UI component does not exist in `src/components/ui/`, **create it there first**, then use it:

- One CSS Module per component (e.g. `Button.module.css`) — never inline styles or global utility classes from `global.css`
- Typed props with TypeScript discriminated unions for `variant` and `size`
- Style exclusively via design tokens from `src/styles/global.css` — no hardcoded colours, spacing, or radii
- Components in `src/components/ui/` must be brand-agnostic — no domain terms (Routine, Session, Set, etc.)

Current components: `Button`, `Input`, `Card`, `Dialog`.
