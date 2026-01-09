# RPG Systems Feature

The RPG Systems feature allows users to browse and utilize specific rulesets for various tabletop role-playing games.

## Description
A dynamic system that loads and displays information about different RPG systems (e.g., D&D 5e, Ordem Paranormal, Tormenta 20). It provides a structured view of rules, classes, and abilities.

## Business Rules
- **Dynamic Routing**: Systems should be accessible via slug-based URLs (e.g., `/systems/dnd5e`).
- **Standardization**: Different systems should follow a similar UI structure for consistency, even if their underlying rules vary.
- **Integration**: Systems documented here should align with the features available in the Discord bot (like character sheet tracking).

## LLM Context
- **System Logic**: LLMs can use these documents to understand the specific rules of a game when helping a user create a character or resolve a roll.
- **Data Source**: Systems are likely loaded from a CMS or local JSON files in `src/data/systems`.

## Technical Implementation
- **Index Page**: `src/pages/systems/index.astro`
- **Dynamic Page**: `src/pages/systems/[system].astro`
- **Components**: `src/components/MultiSystems.astro`, `src/components/Markdown.ts`

## State Management
- **Content-Driven**: Data is pulled from `t.posts.sistemas` (i18n engine).
- **Markdown Rendering**: Uses a custom `markdownToHtml` utility with sanitization.
