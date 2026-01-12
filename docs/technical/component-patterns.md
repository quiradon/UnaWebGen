# Component Patterns & Styling

MiniKraken uses a hybrid approach for UI construction, combining static Astro components with interactive React/Svelte islands, and a mix of Bootstrap and Tailwind CSS.

## Styling Systems
### 1. Bootstrap (Global Layout)
- **Source**: `public/bootstrap/`
- **Usage**: Used for the main Layout, Grid system, and standard UI elements like Navbar and Footer.
- **Theme**: Dark mode enabled via `<html data-bs-theme="dark">`.

### 2. Tailwind CSS (Targeted Tools)
- **Usage**: Used for complex tools like the `Handout Builder` and `System Editor`.
- **Scope**: Scoped using the `important: ".system-editor"` configuration in `tailwind.config.cjs`. This prevents styles from leaking into the global Bootstrap layout.
- **Tokens**: Uses HSL-based CSS variables for theming (e.g., `--primary`, `--background`).

## Architecture Patterns
### Astro Islands
Interactive features are decoupled into frameworks:
- **React**: Used for the `Handout Builder` (`src/components/handoutbuilder`).
- **Svelte**: Used for simpler interactive components like counters or specific tool interactions.
- **Vanilla JS**: Used for global features like the `AuthWidget` and `Dice Roller` to keep the bundle size small.

### Script Loading
- **Inline Scripts**: Used in Astro pages for quick initialization (e.g., `is:inline`).
- **External Scripts**: Located in `src/scripts/` and bundled by Astro.
- **Public Libs**: Some heavy libraries (like `rpg-dice-roller`) are loaded via CDN in specific pages for performance.

## LLM Usage Guide
- **Adding a new Tool**: Create an Astro page in `src/pages/tools/`. If it's highly interactive, build a React component and mount it with `client:only="react"`.
- **Styling New Components**: Default to Tailwind if working within the `.system-editor` context, otherwise use custom CSS or Bootstrap classes.
