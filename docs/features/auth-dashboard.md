# Authentication & Dashboard

MiniKraken uses Discord for user identification and provides a personalized dashboard for managing bot interaction.

## Description
Integration with Discord OAuth2 for login and a dashboard where users can see their profile, managed servers, and bot-related data.

## Business Rules
- **OAuth Flow**: Must securely redirect to Discord and handle the callback token.
- **Protected Routes**: The dashboard should be accessible only to authenticated users.
- **Session Management**: Needs to handle token expiration and user logout.
- **API Sync**: Data displayed in the dashboard should be synced with the main Fortuna Bot API.

## LLM Context
- **Personalization**: LLMs can use dashboard data (active characters, server list) to provide more relevant assistance.
- **Security**: LLMs should never be asked to handle or store OAuth tokens directly.

## Technical Implementation
- **Widget**: `src/components/AuthWidget.astro`
- **Logic**: `src/scripts/auth-widget.ts` and `src/scripts/session-manager.ts`.
- **Dashboard Root**: `src/pages/dashboard/index.astro`

## State Management
- **Layered Cache**: Memory -> SessionStorage -> API.
- **Component Lifecycle**: Managed using Astro's `astro:page-load` for View Transitions to ensure the auth widget persists across page changes.
