# MiniKraken Overview

MiniKraken is a comprehensive toolkit for RPG players and Game Masters, designed to provide interactive tools, system management, and Discord integration.

## Core Purpose
The project serves as a centralized hub for RPG utilities, ranging from simple dice rollers to complex token animators and custom system builders. It focuses on accessibility, internationalization, and seamless integration with the Discord ecosystem.

## Architecture
- **Framework**: [Astro](https://astro.build/) (Static Site Generation with Islands Architecture).
- **Runtime**: [Bun](https://bun.sh/).
- **Styling**: Tailwind CSS.
- **Components**: Mix of Astro components, React, and Svelte for specific interactive features.
- **Internationalization**: `astro-i18n-aut` with translation files in `i18n/`.
- **Bot Integration**: Deeply connected with a Discord bot (Fortuna/MiniKraken), featuring command documentation and a dashboard.

## LLM Context
When assisting with this codebase, keep in mind:
- **I18n focus**: Most UI text should be pulled from the `i18n` JSON files.
- **Islands Architecture**: Complex interactive state is often handled in Svelte or React components embedded in Astro pages.
- **RPG Domain**: Familiarity with TTRPG (Tabletop Role-Playing Game) concepts like dice notation (`1d20+5`), VTT (Virtual Tabletop) tokens, and character sheets is essential.

## Main Routes
- `/`: Home page with overview of features.
- `/commands`: Documentation for Discord bot commands.
- `/tools/`: Collection of interactive utilities (Tarot, Morse, Weather, etc.).
- `/systems/`: Viewing and managing RPG systems.
- `/dashboard`: User profile and bot management.
