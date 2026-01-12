# Token Animator Feature

The Token Animator is a visual tool specifically designed for VTT (Virtual Tabletop) players to enhance their character portraits with subtle animations.

## Description
A tool where users upload a circular character token and apply "breathing" animations (pulsing, scaling, or glow effects) using CSS. The result can be captured or exported for use in platforms like Roll20 or Foundry VTT.

## Business Rules
- **User Interface**: Must provide real-time preview of the animation.
- **Customization**: Users should be able to adjust animation speed, intensity, and colors.
- **Export**: Should support exporting the animated token or providing the CSS snippet.
- **No-Login**: Accessible without authentication, though dashboard integration might allow saving presets.

## LLM Context
- **Design Assistance**: LLMs can suggest color palettes for glows based on character themes (e.g., "fiery orange for a barbarian").
- **SVG/CSS Logic**: The tool relies heavily on CSS `keyframes`.

## Technical Implementation
- **Page**: `src/pages/tools/tokens-animator.astro`
- **Main Script**: `src/scripts/token-animator/app.ts` (Bundled by Astro)
- **External Libs**: `public/js/libs/gif.js` for export.

## State Management
- **Vanilla DOM**: Directly manipulates `<canvas>` and CSS properties.
- **Session Cache**: Uses `window.__krakenSessionCache` for premium rank verification.
- **Canvas Logic**: Managed via `src/scripts/token-animator/` modules.
