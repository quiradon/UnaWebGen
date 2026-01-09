# I18n Engine Technical Documentation

MiniKraken uses a custom file-based internationalization system to manage translations across multiple languages.

## File Structure
- **Root Directory**: `i18n/`
- **Format**: JSON files named by locale (e.g., `en.json`, `pt.json`).
- **Implementation**: Managed in `src/lib/i18n.ts`.

## Core Components
### `loadT(lang: string)`
Reads the corresponding JSON file from the `i18n/` folder using Node's `fs.readFileSync`.
- **Server-side only**: Since it uses `node:fs`, it must be used in Astro component scripts (the YAML-like frontmatter) or server-side functions.
- **Return Type**: `Translations` (a JSON object with an extra `lang` key).

### `getValidatedLanguage(astroLocals: any, requestedLang?: string)`
Ensures the requested language is available in the `i18n/` folder, falling back to English (`en`) if not found.

## How to add a new language
1. Create a new JSON file in `i18n/` (e.g., `es.json`).
2. Add the language code to the `locales` array in dynamic pages like `src/pages/systems/[system].astro`.
3. Translate all keys from `en.json`.

## LLM Usage Guide
When adding UI text:
- **Never hardcode strings**: Always find or add a key in `i18n/*.json`.
- **Usage in Astro**: 
  ```astro
  ---
  import { loadT } from '@lib/i18n';
  const t = loadT('pt');
  ---
  <h1>{t.home.title}</h1>
  ```
