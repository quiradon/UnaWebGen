interface User {
  display_name?: string;
  username?: string;
  avatar_url?: string;
}

interface SessionResponse {
  authenticated: boolean;
  user?: User;
}

interface WidgetElements {
  loginAnchor: HTMLAnchorElement | null;
  userBlock: HTMLElement | null;
  nameElement: HTMLElement | null;
  usernameElement: HTMLElement | null;
  avatarElement: HTMLImageElement | null;
  logoutButton: HTMLButtonElement | null;
  toggleButton: HTMLElement | null;
  dropdown: HTMLElement | null;
}

interface KrakenWindow extends Window {
  __krakenAuthWidgetInit?: boolean;
  __krakenAuthSessionPromise?: Promise<SessionResponse | null>;
}

(function () {
  if (typeof window === 'undefined') return;

  const win = window as KrakenWindow;

  if (win.__krakenAuthWidgetInit) {
    return;
  }
  win.__krakenAuthWidgetInit = true;

  // Cache compartilhado de sessão para todas as instâncias
  let cachedSession: SessionResponse | null = null;
  let sessionFetchPromise: Promise<SessionResponse | null> | null = null;

  const initWidget = (root: HTMLElement): void => {
    if (!root || root.dataset.authInitialized === 'true') {
      return;
    }

    root.dataset.authInitialized = 'true';

    // Buscar templates no documento (não mais dentro de um container)
    const variant = root.dataset.variant || 'desktop';
    const loginTemplate = document.querySelector<HTMLTemplateElement>(`template[data-auth-template="login"][data-variant="${variant}"]`);
    const userTemplate = document.querySelector<HTMLTemplateElement>(`template[data-auth-template="user"][data-variant="${variant}"]`);

    if (!loginTemplate || !userTemplate) {
      console.warn('AuthWidget: Missing required templates');
      return;
    }

    const apiBase = root.dataset.api || '';
    if (!apiBase) {
      console.warn('AuthWidget: Missing API base URL');
      return;
    }

    const trimmedBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
    const sessionEndpoint = `${trimmedBase}/auth/session`;
    const loginEndpoint = `${trimmedBase}/auth/discord`;
    const logoutEndpoint = `${trimmedBase}/auth/logout`;

    const elements: WidgetElements = {
      loginAnchor: null,
      userBlock: null,
      nameElement: null,
      usernameElement: null,
      avatarElement: null,
      logoutButton: null,
      toggleButton: null,
      dropdown: null,
    };

    const updateLoginLink = (): void => {
      if (!elements.loginAnchor) return;
      try {
        const loginTarget = new URL(loginEndpoint);
        loginTarget.searchParams.set('redirect', window.location.href);
        elements.loginAnchor.href = loginTarget.toString();
      } catch {
        elements.loginAnchor.href = loginEndpoint;
      }
    };

    const tidyUrl = (): void => {
      try {
        const current = new URL(window.location.href);
        let mutated = false;

        if (current.searchParams.has('login')) {
          current.searchParams.delete('login');
          mutated = true;
        }

        if (current.searchParams.has('login_error')) {
          current.searchParams.delete('login_error');
          mutated = true;
        }

        if (mutated) {
          window.history.replaceState(window.history.state, document.title, current.toString());
        }
      } catch {
        // ignore URL cleanup issues
      }
    };

    const closeDropdown = (): void => {
      if (!elements.dropdown || !elements.toggleButton) return;
      elements.dropdown.hidden = true;
      elements.toggleButton.setAttribute('aria-expanded', 'false');
    };

    const toggleDropdown = (): void => {
      if (!elements.dropdown || !elements.toggleButton) return;
      const isOpen = !elements.dropdown.hidden;
      elements.dropdown.hidden = isOpen;
      elements.toggleButton.setAttribute('aria-expanded', (!isOpen).toString());
    };

    const handleOutsideClick = (event: MouseEvent): void => {
      if (!elements.userBlock || !elements.dropdown || elements.dropdown.hidden) return;
      const target = event.target as Node;
      if (!target) return;
      if (!elements.userBlock.contains(target)) {
        closeDropdown();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    // Add event listeners once
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleEscapeKey);

    const destroyRoot = (): void => {
      // Destruição COMPLETA - remove absolutamente tudo
      root.innerHTML = '';
      
      // Remove TODAS as classes
      root.className = '';
      
      // Remove TODOS os atributos inline
      root.removeAttribute('style');
      
      // Remove TODOS os data-attributes (exceto data-auth-root)
      const attributes = Array.from(root.attributes);
      attributes.forEach(attr => {
        if (attr.name !== 'data-auth-root') {
          root.removeAttribute(attr.name);
        }
      });
    };

    const renderLoginView = (): void => {
      // DESTRUIÇÃO TOTAL antes de renderizar
      destroyRoot();
      
      // Clone LIMPO do template de login
      const fragment = loginTemplate.content.cloneNode(true) as DocumentFragment;
      
      // Injetar DIRETAMENTE no root (substituição completa)
      root.appendChild(fragment);
      
      // Buscar elementos APENAS do login
      elements.loginAnchor = root.querySelector<HTMLAnchorElement>('[data-auth-login]');
      
      // DESTRUIR todas as referências do usuário
      elements.userBlock = null;
      elements.nameElement = null;
      elements.usernameElement = null;
      elements.avatarElement = null;
      elements.logoutButton = null;
      elements.toggleButton = null;
      elements.dropdown = null;
      
      updateLoginLink();
    };

    const bindUserInteractions = (): void => {
      if (!elements.toggleButton || !elements.logoutButton) return;

      // Handle toggle button click
      elements.toggleButton.addEventListener('click', (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        toggleDropdown();
      });

      // Handle toggle button keyboard
      elements.toggleButton.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          event.stopPropagation();
          toggleDropdown();
        }
      });

      // Handle logout
      elements.logoutButton.addEventListener('click', async (event: MouseEvent) => {
        event.preventDefault();
        
        if (!elements.logoutButton) return;
        elements.logoutButton.disabled = true;
        
        try {
          await fetch(logoutEndpoint, {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.error('Failed to logout', error);
        } finally {
          window.location.reload();
        }
      });
    };

    const renderUserView = (user: User): void => {
      // DESTRUIÇÃO TOTAL antes de renderizar
      destroyRoot();
      
      // Clone LIMPO do template de usuário
      const fragment = userTemplate.content.cloneNode(true) as DocumentFragment;
      
      // Injetar DIRETAMENTE no root (substituição completa)
      root.appendChild(fragment);

      // Buscar elementos APENAS do usuário
      elements.userBlock = root.querySelector<HTMLElement>('[data-auth-user]');
      elements.avatarElement = root.querySelector<HTMLImageElement>('[data-auth-avatar]');
      elements.nameElement = root.querySelector<HTMLElement>('[data-auth-name]');
      elements.usernameElement = root.querySelector<HTMLElement>('[data-auth-username]');
      elements.toggleButton = root.querySelector<HTMLElement>('[data-auth-toggle]');
      elements.dropdown = root.querySelector<HTMLElement>('[data-auth-dropdown]');
      elements.logoutButton = root.querySelector<HTMLButtonElement>('[data-auth-logout]');
      
      // DESTRUIR todas as referências do login
      elements.loginAnchor = null;

      // Validar que todos os elementos necessários existem
      if (
        !elements.userBlock ||
        !elements.avatarElement ||
        !elements.nameElement ||
        !elements.usernameElement ||
        !elements.toggleButton ||
        !elements.dropdown ||
        !elements.logoutButton
      ) {
        console.warn('AuthWidget: Missing user template elements, falling back to login');
        renderLoginView();
        return;
      }

      const displayName = user.display_name || user.username || 'Discord User';
      
      // Truncar para 15 caracteres
      const truncatedName = displayName.length > 15 
        ? displayName.substring(0, 15) 
        : displayName;

      // Configurar avatar
      elements.avatarElement.src = user.avatar_url || '';
      elements.avatarElement.alt = displayName;

      // Configurar nome completo no dropdown
      elements.nameElement.textContent = displayName;
      
      // Configurar nome truncado ao lado do avatar
      elements.usernameElement.textContent = truncatedName;

      // Fechar dropdown inicialmente
      elements.dropdown.hidden = true;
      elements.toggleButton.setAttribute('aria-expanded', 'false');

      // Vincular interações do usuário
      bindUserInteractions();
    };

    const getSession = async (): Promise<SessionResponse | null> => {
      // Se já temos cache, retornar imediatamente
      if (cachedSession !== null) {
        return cachedSession;
      }

      // Se já há uma requisição em andamento, reutilizar
      if (sessionFetchPromise) {
        return sessionFetchPromise;
      }

      // Criar nova requisição compartilhada
      sessionFetchPromise = (async () => {
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
          cachedSession = payload;
          return payload;
        } catch (error) {
          console.error('Failed to load auth session', error);
          cachedSession = { authenticated: false };
          return cachedSession;
        } finally {
          // Limpar a promise após completar
          sessionFetchPromise = null;
        }
      })();

      return sessionFetchPromise;
    };

    const fetchSession = async (): Promise<void> => {
      try {
        root.setAttribute('data-auth-loading', 'true');
        
        const payload = await getSession();
        
        if (payload && payload.authenticated && payload.user) {
          renderUserView(payload.user);
        } else {
          renderLoginView();
        }
      } catch (error) {
        console.error('Failed to render auth widget', error);
        renderLoginView();
      } finally {
        tidyUrl();
        root.classList.remove('auth-widget__root--loading');
        root.removeAttribute('data-auth-loading');
      }
    };

    fetchSession();
  };

  const initAll = (): void => {
    document.querySelectorAll<HTMLElement>('[data-auth-root]').forEach((root) => {
      initWidget(root);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll, { once: true });
  } else {
    initAll();
  }
})();
