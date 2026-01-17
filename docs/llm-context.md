# LLM Context & Prompt Engineering Guide

This document is intended to be provided to LLMs (like GPT-4, Claude, or Antigravity) to ensure they have the full context of the MiniKraken project architecture and business rules.

## Core Project Identity
MiniKraken is an RPG toolkit built with **Astro**, **Bun**, and **Tailwind/Bootstrap**. It is deeply integrated with the **Fortuna Discord Bot**.

## Standard System Prompt Snippet
> You are an expert developer working on the MiniKraken project. 
> 1. **I18next Context**: Documentation is in `i18n/*.json`. Never hardcode UI strings.
> 2. **Islands**: Check if the feature is in React (`src/components/handoutbuilder`) 
> 3. **Session**: Always use `src/scripts/session-manager.ts` for auth logic.
> 4. **Styling**: Tailwind is used inside `.system-editor` containers; Bootstrap is for layout.

## Module Cheat Sheet for LLMs
- **Auth**: `src/components/AuthWidget.astro` + `src/scripts/auth-widget.ts`.
- **Translations**: `src/lib/i18n.ts` using `loadT(locale)`.
- **Dice Logic**: Uses `@dice-roller/rpg-dice-roller` (UMD version in `dices.astro`).
- **Styles**: `tailwind.config.cjs` defines the core color tokens.

## Common Tasks & Prompt Samples
### task: Add a new translation key
**Rule**: Keep keys organized by page or component.
**Sample Prompt**: "Add a new translation key 'hero.cta' to all JSON files in `i18n/`. The default value is 'Start Journey'."

### task: Create a new Tool page
**Rule**: Use `src/layouts/Layout.astro` and pull metadata from `t.nav.tools`.
**Sample Prompt**: "Create a new Astro page for a 'Monster Generator' tool. It should use the default Layout, be translated via i18n, and follow the dark theme styling."

## Coding Standards
- Use **TypeScript** for all new scripts.
- Prefer **Functional Components** for React.
- Use **Lucide Icons** via `@lucide/astro`.
- **Max File Length**: Do not exceed 400 lines per file. Separate logic and UI into smaller components/files.
- Ensure **View Transitions** compatibility by using `window.__kraken` caches for state.
