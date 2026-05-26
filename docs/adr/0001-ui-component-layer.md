# UI component layer: CSS Modules + native HTML, no utility framework

All UI is built from typed React components in `src/components/ui/`, styled with CSS Modules and design tokens defined in `src/styles/global.css`. No Tailwind, no shadcn/ui, no Radix UI.

## Considered options

- **Tailwind CSS** — rejected because utility classes end up scattered across every component file, making visual consistency harder to enforce, not easier.
- **shadcn/ui** — rejected because its components are Tailwind-based; copying them in would import the same utility-class sprawl under a different name.
- **Radix UI primitives** — not ruled out permanently, but deferred. The current component set (`Button`, `Input`, `Card`, `Dialog`) is simple enough that native HTML elements cover the accessibility requirements. Add Radix only if a specific component demands it (e.g. an animated bottom sheet with complex focus management).

## Consequences

Any new UI element must live in `src/components/ui/` before being used in page or feature components. If a needed component doesn't exist, create it there first. This keeps bare `<button>` and `<input>` elements out of feature code and makes the token system the single source of visual truth.
