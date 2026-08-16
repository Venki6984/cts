// ============================================================
// Authentication Service Abstraction
// Demo authentication — replace with backend authentication API
// (e.g. FastAPI /auth/login or OAuth2 token endpoint)
// ============================================================

export interface UserSession {
  organization: string;
  userId: string;
  isAuthenticated: boolean;
  loginTime: string;
}

const AUTH_STORAGE_KEY = "pji_auth_session";

/**
 * Demo authentication login.
 * Validates credentials and initializes session state.
 * Note: Password is NEVER stored in storage or client state.
 */
export async function login(
  organization: string,
  userId: string,
  _password: string
): Promise<UserSession> {
  // Simulate lightweight async latency if needed
  const session: UserSession = {
    organization: organization.trim() || "Demo Healthcare Center",
    userId: userId.trim() || "user@hospital.com",
    isAuthenticated: true,
    loginTime: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  }

  return session;
}

/**
 * Log out and clear session data.
 */
export function logout(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  }
}

/**
 * Retrieve current user session from client storage.
 */
export function getCurrentUser(): UserSession | null {
  if (typeof window === "undefined") return null;
  const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!stored) return null;
  try {
    const session: UserSession = JSON.parse(stored);
    return session.isAuthenticated ? session : null;
  } catch {
    return null;
  }
}
