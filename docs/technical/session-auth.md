# Session & Authentication Technical Documentation

The authentication system integrates Discord OAuth2 and maintains session state across the site's pages, handling both standard navigation and Astro View Transitions.

## Architecture
- **OAuth Provider**: Discord.
- **Session Management**: Centralized in `src/scripts/session-manager.ts`.
- **UI Implementation**: Handled by `src/components/AuthWidget.astro` and its companion script `src/scripts/auth-widget.ts`.

## State Management (`session-manager.ts`)
The session manager uses several layers for performance and persistence:
1.  **In-Memory Cache**: `cachedSession` variable for the current page life.
2.  **Global Cache**: Persistent across View Transitions using `window.__krakenSessionCache`.
3.  **Persistence**: `sessionStorage` (`kraken_session_payload`) to survive tab refreshes.
4.  **Promise Caching**: Ensures multiple components calling `getSession()` simultaneously only trigger one network request.

## Authentication Flow
1.  **Login**: User is redirected to `${api_url}/auth/discord?redirect=${current_url}`.
2.  **Callback**: Backend sets an `httpOnly` cookie and redirects back with `?login=success`.
3.  **Hydration**: `AuthWidget` sees the parameter, sets a session flag, and calls `getSession()` to fetch user data from `${api_url}/auth/session`.

## API Integration
The client communicates with the Fortuna Bot API (configured via `PUBLIC_API_URL`).
- **Endpoints**:
    - `POST /auth/logout`: Invalidates the session.
    - `GET /auth/session`: Returns the current user profile and premium status.

## LLM Usage Guide
- **Protected Actions**: Before suggesting features that require premium rank, check `session.premium.active && session.premium.level >= 1`.
- **Context Link**: See `src/scripts/session-manager.ts` for the full interface definition of `User` and `Premium`.
