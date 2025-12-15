/**
 * Session Manager - centraliza validação de sessão no SPA.
 *
 * Mantém um único cache/promise em memória e no window para
 * reaproveitar a mesma resposta entre páginas e componentes.
 */

export interface User {
  id?: string;
  display_name?: string;
  username?: string;
  avatar_url?: string;
}

export interface Premium {
  level: number;
  active: boolean;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: User;
  premium?: Premium;
}

interface SessionManagerWindow extends Window {
  __krakenSessionCache?: SessionResponse | null;
  __krakenSessionPromise?: Promise<SessionResponse> | null;
}

const win = (typeof window !== 'undefined' ? window : {}) as SessionManagerWindow;

let cachedSession: SessionResponse | null = null;
let sessionPromise: Promise<SessionResponse> | null = null;

const SESSION_STORAGE_KEY = 'kraken_session_payload';

const normalizeBase = (apiBase: string): string =>
  apiBase && apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;

export async function getSession(apiBase: string, forceRefresh = false): Promise<SessionResponse> {
  const normalizedBase = normalizeBase(apiBase);
  if (!normalizedBase) return { authenticated: false };

  if (forceRefresh) {
    cachedSession = null;
    sessionPromise = null;
    win.__krakenSessionCache = null;
    win.__krakenSessionPromise = null;

    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  // Tentar hidratar do sessionStorage se ainda não temos cache
  if (!cachedSession && typeof sessionStorage !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        cachedSession = JSON.parse(stored) as SessionResponse;
        win.__krakenSessionCache = cachedSession;
      }
    } catch {
      // ignore parse errors
    }
  }

  if (win.__krakenSessionCache) {
    cachedSession = win.__krakenSessionCache;
    return cachedSession;
  }

  if (cachedSession) {
    win.__krakenSessionCache = cachedSession;
    return cachedSession;
  }

  if (win.__krakenSessionPromise) {
    return win.__krakenSessionPromise;
  }

  if (sessionPromise) {
    win.__krakenSessionPromise = sessionPromise;
    return sessionPromise;
  }

  const sessionEndpoint = `${normalizedBase}/auth/session`;

  const newPromise = (async () => {
    try {
      const response = await fetch(sessionEndpoint, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Session response not ok: ${response.status}`);
      }

      const payload: SessionResponse = await response.json();
      cachedSession = payload;
      win.__krakenSessionCache = payload;

      try {
        if (payload.authenticated) {
          sessionStorage.setItem('kraken_session_present', '1');
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
        } else {
          sessionStorage.removeItem('kraken_session_present');
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch {
        // ignore storage errors
      }

      return payload;
    } catch (error) {
      console.error('Failed to load auth session', error);
      const errorPayload: SessionResponse = { authenticated: false };
      cachedSession = errorPayload;
      win.__krakenSessionCache = errorPayload;
      try {
        sessionStorage.removeItem('kraken_session_present');
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
      return errorPayload;
    } finally {
      sessionPromise = null;
      win.__krakenSessionPromise = null;
    }
  })();

  sessionPromise = newPromise;
  win.__krakenSessionPromise = newPromise;
  return newPromise;
}

export function getCachedSession(): SessionResponse | null {
  if (win.__krakenSessionCache) return win.__krakenSessionCache;
  if (!cachedSession && typeof sessionStorage !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        cachedSession = JSON.parse(stored) as SessionResponse;
        win.__krakenSessionCache = cachedSession;
      }
    } catch {
      // ignore
    }
  }
  return cachedSession;
}

export function primeSessionCache(apiBase: string): Promise<SessionResponse> {
  if (!apiBase) {
    return Promise.resolve({ authenticated: false });
  }
  return getSession(apiBase);
}

export function clearSessionCache(): void {
  cachedSession = null;
  sessionPromise = null;
  win.__krakenSessionCache = null;
  win.__krakenSessionPromise = null;
  try {
    sessionStorage.removeItem('kraken_session_present');
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

export function hasSessionIndicator(): boolean {
  try {
    return sessionStorage.getItem('kraken_session_present') === '1';
  } catch {
    return false;
  }
}

export async function getSessionCachedFirst(apiBase: string): Promise<SessionResponse> {
  return getCachedSession() ?? getSession(apiBase);
}

export async function revalidateSession(apiBase: string): Promise<SessionResponse | null> {
  const normalizedBase = normalizeBase(apiBase);
  if (!normalizedBase) return null;

  const sessionEndpoint = `${normalizedBase}/auth/session`;

  try {
    const response = await fetch(sessionEndpoint, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Session response not ok: ${response.status}`);
    }

    const payload: SessionResponse = await response.json();
    cachedSession = payload;
    win.__krakenSessionCache = payload;

    try {
      if (payload.authenticated) {
        sessionStorage.setItem('kraken_session_present', '1');
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
      } else {
        sessionStorage.removeItem('kraken_session_present');
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }

    return payload;
  } catch (error) {
    console.error('Failed to revalidate auth session', error);
    return null;
  }
}
