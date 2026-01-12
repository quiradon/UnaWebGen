# Tools Suite

The Tools Suite is a collection of diverse utilities designed to enhance the RPG experience with flavor and functional aids.

## Included Tools
- **Tarot**: Virtual tarot card drawing with meanings.
- **Morse Code**: Translator for encoded messages in games.
- **Name Generator**: Generates thematic names for NPCs or characters.
- **Weather**: Simulates weather conditions for world-building.
- **Morse**: Translator for morse code.
- **Coinflip**: Simple heads or tails utility.
- **Poker**: Cards and hands management.

## Business Rules
- **Thematic Consistency**: All tools should maintain an "arcane" or "technological" aesthetic consistent with MiniKraken.
- **State management**: Interactive tools (like Tarot) should ideally handle state locally to allow resets.
- **I18n**: Tool names and descriptions must be translated.

## LLM Context
- **Helper Potential**: LLMs can suggest which tool to use based on a GM's scenario (e.g., "The players find a strange machine... use the Morse tool?").
- **Customization**: LLMs can help expand the name generators or weather tables.

## Technical Implementation
- **Route**: `src/pages/tools/*`
- **Architecture**: Most tools are standalone Astro pages with embedded `<script>` tags for logic.

## State Management
- **Local/Ephemeral**: Most tools use local JS variables and DOM state.
- **No Persistence**: Unless integrated with the dashboard, tool states (like a drawn Tarot card) are lost on refresh.
