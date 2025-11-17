// src/scripts/session-manager.ts
var win = typeof window !== "undefined" ? window : {};
var cachedSession = null;
var sessionPromise = null;
var SESSION_STORAGE_KEY = "kraken_session_payload";
var normalizeBase = (apiBase) => apiBase && apiBase.endsWith("/") ? apiBase.slice(0, -1) : apiBase;
async function getSession(apiBase, forceRefresh = false) {
  const normalizedBase = normalizeBase(apiBase);
  if (!normalizedBase)
    return { authenticated: false };
  if (forceRefresh) {
    cachedSession = null;
    sessionPromise = null;
    win.__krakenSessionCache = null;
    win.__krakenSessionPromise = null;
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {}
  }
  if (!cachedSession && typeof sessionStorage !== "undefined") {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        cachedSession = JSON.parse(stored);
        win.__krakenSessionCache = cachedSession;
      }
    } catch {}
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
        credentials: "include",
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        throw new Error(`Session response not ok: ${response.status}`);
      }
      const payload = await response.json();
      cachedSession = payload;
      win.__krakenSessionCache = payload;
      try {
        if (payload.authenticated) {
          sessionStorage.setItem("kraken_session_present", "1");
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
        } else {
          sessionStorage.removeItem("kraken_session_present");
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch {}
      return payload;
    } catch (error) {
      console.error("Failed to load auth session", error);
      const errorPayload = { authenticated: false };
      cachedSession = errorPayload;
      win.__krakenSessionCache = errorPayload;
      try {
        sessionStorage.removeItem("kraken_session_present");
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {}
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
function primeSessionCache(apiBase) {
  if (!apiBase) {
    return Promise.resolve({ authenticated: false });
  }
  return getSession(apiBase);
}

// src/scripts/session-prime.ts
var defaults = window.__KRAKEN_AUTH_DEFAULTS;
if (defaults?.apiBase) {
  primeSessionCache(defaults.apiBase);
}
