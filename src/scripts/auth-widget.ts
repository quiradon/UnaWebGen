import { getSession, clearSessionCache, type SessionResponse, type User } from './session-manager';

interface WidgetElements {
  loginAnchor: HTMLAnchorElement | null;
  userBlock: HTMLElement | null;
  nameElement: HTMLElement | null;
  usernameElement: HTMLElement | null;
  avatarElement: HTMLImageElement | null;
  premiumBadge: HTMLImageElement | null;
  logoutButton: HTMLButtonElement | null;
  toggleButton: HTMLElement | null;
  dropdown: HTMLElement | null;
}

interface KrakenWindow extends Window {
  __krakenAuthWidgetInit?: boolean;
}

(function () {
  if (typeof window === 'undefined') return;

  const win = window as KrakenWindow;

  if (win.__krakenAuthWidgetInit) {
    return;
  }
  win.__krakenAuthWidgetInit = true;

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
      premiumBadge: null,
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

    // Se o frontend recebeu redirect de login com ?login=success, setamos
    // uma flag em sessionStorage para indicar que o cookie httpOnly foi criado
    // no backend. Isso funciona como fallback porque o cookie real é httpOnly
    // e não aparece em document.cookie.
    try {
      const _u = new URL(window.location.href);
      if (_u.searchParams.get('login') === 'success') {
        sessionStorage.setItem('kraken_session_present', '1');
      }
      if (_u.searchParams.has('login_error')) {
        // caso de erro de login, removemos qualquer flag existente
        sessionStorage.removeItem('kraken_session_present');
      }
    } catch {
      // ignore URL parse issues
    }

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
      elements.premiumBadge = null;
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
          // Limpar o cache de sessão
          clearSessionCache();
        } catch (error) {
          console.error('Failed to logout', error);
        } finally {
          window.location.reload();
        }
      });
    };

    const renderUserView = (session: SessionResponse): void => {
      const user = session.user;
      if (!user) return;
      // DESTRUIÇÃO TOTAL antes de renderizar
      destroyRoot();
      
      // Clone LIMPO do template de usuário
      const fragment = userTemplate.content.cloneNode(true) as DocumentFragment;
      
      // Injetar DIRETAMENTE no root (substituição completa)
      root.appendChild(fragment);

      // Buscar elementos APENAS do usuário
      elements.userBlock = root.querySelector<HTMLElement>('[data-auth-user]');
      elements.avatarElement = root.querySelector<HTMLImageElement>('[data-auth-avatar]');
      elements.premiumBadge = root.querySelector<HTMLImageElement>('[data-auth-premium-badge]');
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

      // Configurar badge premium (exibir se level >= 1)
      if (elements.premiumBadge && session.premium && session.premium.level >= 1 && session.premium.active) {
        const level = Math.min(Math.max(session.premium.level, 1), 4); // Limitar entre 1 e 4
        elements.premiumBadge.src = `/img/tiers_premium/${level}.webp`;
        elements.premiumBadge.style.display = 'block';
      } else if (elements.premiumBadge) {
        elements.premiumBadge.style.display = 'none';
      }

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

    const fetchSession = async (): Promise<void> => {
      try {
        root.setAttribute('data-auth-loading', 'true');
        
        // Usar o session manager centralizado
        const payload = await getSession(trimmedBase);
        
        if (payload && payload.authenticated && payload.user) {
          renderUserView(payload);
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
