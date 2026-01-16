# Dice Roller Feature

The Dice Roller is a core utility for RPG players, providing a visual and programmatic way to roll dice with complex modifiers.

## Description
A web interface that allows users to roll standard polyhedral dice (d4, d6, d8, d10, d12, d20, d100) and custom dice notations.

## Business Rules
- **Notation**: Must support standard RPG notation (e.g., `2d10+5`, `1d20-2`).
- **History**: Rolls should be tracked in a session history for reference.
- **Visual Feedback**: The result should be clearly displayed with a breakdown of individual die results if possible.
- **Presets**: Frequently used dice (like d20) should be available as quick-click buttons.

## LLM Context
- **Dice Logic**: Uses `@dice-roller/rpg-dice-roller` library for parsing and rolling.
- **Components**: Often integrated into larger character sheet views or as a standalone tool.
- **Interaction**: LLMs can suggest complex rolls based on character stats (e.g., "Roll for initiative with +3 bonus").

## Technical Implementation
- **Page**: `src/pages/dices.astro`
- **Logic Script**: `/js/dice_roll.js` (loaded via CDN/public folder)
- **Dependencies**: `@dice-roller/rpg-dice-roller` (UMD version)

## State Management
- **Global Object**: Operates on a global `diceRoller` instance exposed in the browser.
- **DOM Interaction**: Uses `getElementById` for input/output.
