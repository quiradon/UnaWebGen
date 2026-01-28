# Handout Builder Feature

The Handout Builder allows Game Masters to create immersive physical or digital documents for their players.

## Description
A visual editor for creating RPG handouts like letters, scrolls, or official documents. It uses various themes (Old Paper, Tech, etc.) and allows text formatting.

## Business Rules
- **Theming**: Must support multiple visual styles to fit different genres (Fantasy, Sci-Fi).
- **Exporting**: Users should be able to download the handout as an image (PNG) or PDF.
- **Interactive Elements**: Support for signatures, stamps, or specific RPG-styled headers.

## LLM Context
- **Content Generation**: LLMs are perfect for writing the content of the handouts (e.g., "Write a mysterious letter from an anonymous informant").
- **Formatting**: LLMs can help structure the layout using Markdown or HTML hints.

## Technical Implementation
- **Page**: `src/pages/dashboard/handout-builder.astro`
- **Templates Gallery (public)**: `src/pages/handouts/index.astro`
- **Core App**: `src/components/handoutbuilder/HandoutCanvasApp.tsx`
- **Styles**: `src/styles/handout-builder.css`
- **Dependency**: `html-to-image` for exporting.

## State Management
- **React State**: Comprehensive use of `useState` and `useRef` for visual editor logic.
- **Portal**: Uses React portals for modals/overlays in the editor.
