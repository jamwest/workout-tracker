---
title: UI Component Layer
date: 2026-05-27
status: in-progress
issue: GH-13
---

## Problem Statement

The app uses bare HTML elements (`<button>`, `<input>`, `<dialog>`) directly in feature
components, with styling applied inconsistently via global utility classes in
`src/styles/global.css`. RoutineCard contains unstyled button elements, ConfirmDialog
is completely unstyled, and form components apply the `.input` class inconsistently. As
the Session and History pages are built out, this will produce a fragmented visual
experience with no mechanism to enforce consistency — any developer or agent can
introduce a one-off button style without touching the design system.

## Solution

Introduce a typed React component layer at `src/components/ui/`. Four components cover
all current and near-term UI needs: `Button`, `Input`, `Card`, and `Dialog`. Each owns
its styling via a co-located CSS Module and exposes a typed TypeScript API (discriminated
unions for `variant` and `size`). Design tokens stay in `src/styles/global.css`;
component-specific styles (currently `.btn`, `.card`, `.input` global classes) migrate
into their respective modules. Existing feature components are updated to import from
`src/components/ui/` rather than using bare HTML elements. After migration, `global.css`
retains only tokens and layout utilities.

## User Stories

1. As a developer, I want a typed `Button` component with variant props, so that all
   buttons share the same visual style without manually applying global CSS classes.
2. As a developer, I want a typed `Input` component, so that all text and number inputs
   are consistently styled and I never reach for a bare `<input>`.
3. As a developer, I want a typed `Card` component, so that all card containers share
   consistent surface colour, padding, and radius.
4. As a developer, I want a typed `Dialog` component wrapping the native `<dialog>`
   element, so that confirmation dialogs are accessible and consistently styled.
5. As a developer or AI agent, I want existing feature components (RoutineCard,
   NewRoutineForm, AddExerciseForm, ExerciseTypeSelector, ConfirmDialog) to use
   `src/components/ui/` components, so the current UI is visually consistent.
6. As a developer, I want `global.css` to contain only design tokens and layout
   utilities after migration, so the boundary between tokens and component styles is
   explicit.

## Design Decisions

**CSS Modules over Tailwind or shadcn/ui.** Utility-class frameworks move visual
consistency concerns from CSS into JSX — variant logic scatters across className strings
rather than staying isolated in one module. CSS Modules keep styling co-located with its
component. shadcn components are Tailwind-based and would import the same sprawl. See
[ADR-0001](../adr/0001-ui-component-layer.md).

**No Radix UI at this stage.** Button, Input, Card, and Dialog can be built on native
HTML without sacrificing accessibility. The native `<dialog>` element has solid browser
support and covers the ConfirmDialog use case. Add Radix only if a specific component
requires behaviour native elements cannot provide (e.g. animated bottom sheet, complex
focus management).

**Dark-only.** The app targets personal fitness use; gym environments are typically
low-light. Light mode is deferred. Token names are already semantic (`--color-accent`,
`--color-bg-surface`) so a light theme later is a value change, not a rename.

**Component styles migrate out of global.css.** After migration, `global.css` owns only
tokens and layout utilities (`.page`, `.stack`, `.row`, `.row-between`). This makes the
boundary explicit and prevents feature components from bypassing the component layer by
reaching for globals.

## Work Items

- **Button:** `Button.tsx` + `Button.module.css`. Variants: primary | ghost | danger.
  Sizes: md | full. Migrates `.btn*` classes out of `global.css`.
- **Input:** `Input.tsx` + `Input.module.css`. Types: text | number. Migrates `.input`
  out of `global.css`.
- **Card:** `Card.tsx` + `Card.module.css`. Props: `raised` boolean. Migrates `.card`
  out of `global.css`.
- **Dialog:** `Dialog.tsx` + `Dialog.module.css`. Wraps native `<dialog>`. Props:
  `title`, `description`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`,
  `open`. Styles the currently-unstyled ConfirmDialog foundation.
- **Migrate existing components:** Update `RoutineCard`, `NewRoutineForm`,
  `AddExerciseForm`, `ExerciseTypeSelector`, and `ConfirmDialog` to import from
  `src/components/ui/`.
- **Clean up global.css:** Remove `.btn*`, `.card`, `.input` after all consumers are
  migrated. Retain tokens and layout utilities only.

## Out of Scope

- Light / dark theme toggle
- Radix UI or any third-party component primitive
- Brand colour updates (Pyre Fit fire theme — separate concern)
- Animation or transition system beyond existing `global.css` transitions
- Form validation UI (error states, helper text)
- Icon system

## Open Questions

None — all design decisions resolved in the grill session.

## References

- ADR: [ADR-0001 — UI component layer](../adr/0001-ui-component-layer.md)
- Domain vocabulary: [CONTEXT.md](../../CONTEXT.md)
