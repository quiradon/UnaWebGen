/**
 * Session Manager - Gerenciador centralizado de sessões
 * 
 * Este módulo implementa um cache compartilhado em memória para
 * evitar múltiplas requisições simultâneas para /auth/session.
 * 
 * Todas as páginas e componentes devem usar getSession() ao invés
 * de fazer fetch() diretamente para o endpoint de sessão.
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

// Cache de sessão compartilhado globalmente
let cachedSession: SessionResponse | null = null;
let sessionFetchPromise: Promise<SessionResponse> | null = null;

/**
 * Obtém a sessão do usuário com cache automático.
 * 
 * - Se já existe cache, retorna imediatamente
 * - Se há uma requisição em andamento, aguarda e retorna
 * - Caso contrário, cria uma nova requisição compartilhada
 * 
 * @param apiBase - URL base da API (ex: 'https://una-api.arkanus.app')
 * @param forceRefresh - Força atualização ignorando cache
 * @returns Promise com os dados da sessão
 */
export async function getSession(
  apiBase: string,
  forceRefresh = false
): Promise<SessionResponse> {
  // Remover barra final se existir
  const trimmedBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  const sessionEndpoint = `${trimmedBase}/auth/session`;

  // Se forceRefresh, limpar cache
  if (forceRefresh) {
    cachedSession = null;
    sessionFetchPromise = null;
    if (win.__krakenSessionCache) {
      win.__krakenSessionCache = null;
    }
    if (win.__krakenSessionPromise) {
      win.__krakenSessionPromise = null;
    }
  }

  // 1. Verificar cache global do window (para compartilhar entre múltiplas instâncias)
  if (win.__krakenSessionCache !== undefined && win.__krakenSessionCache !== null) {
    cachedSession = win.__krakenSessionCache;
    return cachedSession;
  }

  // 2. Verificar cache local
  if (cachedSession !== null) {
    win.__krakenSessionCache = cachedSession;
    return cachedSession;
  }

  // 3. Se já há uma requisição em andamento, reutilizá-la
  if (win.__krakenSessionPromise) {
    return win.__krakenSessionPromise;
  }

  if (sessionFetchPromise) {
    win.__krakenSessionPromise = sessionFetchPromise;
    return sessionFetchPromise;
  }

  // 4. Criar nova requisição compartilhada
  const newPromise = (async () => {
    try {
      const response = await fetch(sessionEndpoint, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Session response not ok: ${response.status}`);
      }

      const payload: SessionResponse = await response.json();
      
      // Armazenar em cache
      cachedSession = payload;
      win.__krakenSessionCache = payload;

      // Atualizar flag de sessão no sessionStorage
      try {
        if (payload.authenticated) {
          sessionStorage.setItem('kraken_session_present', '1');
        } else {
          sessionStorage.removeItem('kraken_session_present');
        }
      } catch (e) {
        // Ignorar erros de sessionStorage
      }

      return payload;
    } catch (error) {
      console.error('Failed to load auth session', error);
      
      // Cache de resposta negativa
      const errorPayload: SessionResponse = { authenticated: false };
      cachedSession = errorPayload;
      win.__krakenSessionCache = errorPayload;
      
      try {
        sessionStorage.removeItem('kraken_session_present');
      } catch (e) {
        // Ignorar erros de sessionStorage
      }

      return errorPayload;
    } finally {
      // Limpar a promise após completar
      sessionFetchPromise = null;
      win.__krakenSessionPromise = null;
    }
  })();

  // Armazenar a promise para reutilização
  sessionFetchPromise = newPromise;
  win.__krakenSessionPromise = newPromise;

  return newPromise;
}

/**
 * Limpa o cache de sessão.
 * Útil após logout ou quando a sessão for invalidada.
 */
export function clearSessionCache(): void {
  cachedSession = null;
  sessionFetchPromise = null;
  
  if (win.__krakenSessionCache !== undefined) {
    win.__krakenSessionCache = null;
  }
  
  if (win.__krakenSessionPromise !== undefined) {
    win.__krakenSessionPromise = null;
  }

  try {
    sessionStorage.removeItem('kraken_session_present');
  } catch (e) {
    // Ignorar erros de sessionStorage
  }
}

/**
 * Verifica se há indicação de sessão ativa (via sessionStorage).
 * Esta é apenas uma verificação rápida e não substitui getSession().
 */
export function hasSessionIndicator(): boolean {
  try {
    return sessionStorage.getItem('kraken_session_present') === '1';
  } catch {
    return false;
  }
}
