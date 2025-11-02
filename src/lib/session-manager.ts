interface SessionResponse {
  authenticated: boolean;
  sessionId?: string;
  error?: string;
}

export async function getSession(apiBase: string): Promise<SessionResponse> {
  try {
    const response = await fetch(`${apiBase}/auth/session`, {
      credentials: "include",
    });

    if (!response.ok) {
      return { authenticated: false, error: "Sessão inválida" };
    }

    const data = await response.json();
    return {
      authenticated: data.authenticated ?? false,
      sessionId: data.sessionId,
    };
  } catch (err) {
    console.error("Erro ao verificar sessão:", err);
    return { authenticated: false, error: "Erro na verificação de sessão" };
  }
}
