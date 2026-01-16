# Discord Bot Commands

This feature provides a comprehensive list of all commands available for the MiniKraken (Fortuna) Discord bot.

## Description
A searchable and categorized list of bot commands, including descriptions, usage syntax, and required permissions.

## Business Rules
- **Categorization**: Commands must be grouped by category (e.g., Moderation, RPG, Utility).
- **Searchability**: Users should be able to filter commands by name or description.
- **Consistency**: The documentation on the website must match the actual bot implementation.
- **Accessibility**: Clear distinction between slash commands and legacy prefix commands (if applicable).

## LLM Context
- **Command Syntax**: LLMs should refer to this documentation when helping users understand how to trigger specific bot actions.
- **Integration**: The page often pulls data from a centralized command registry or static JSON configuration.

## Technical Implementation
- **Page**: `src/pages/commands.astro`
- **Component**: `src/components/CommandCard.astro`
- **API**: `https://api-rpg.arkanus.app/bot/commands`

## State Management
- **Static Ingestion**: Commands are fetched during build/render time (SSG/SSR).
- **Client Search**: Uses `is:inline` script for local filtering without re-renders.
