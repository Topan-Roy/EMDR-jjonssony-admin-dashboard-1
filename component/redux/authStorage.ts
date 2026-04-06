import type { AuthState } from "./features/authSlice";

const AUTH_STORAGE_KEY = "uk-inkind-auth";

type StoredTokens = {
  token: string | null;
  refreshToken: string | null;
};

const getRoleFromUser = (user: AuthState["user"]): string | null => {
  if (!isRecord(user)) {
    return null;
  }

  const role = user.role;

  if (typeof role !== "string" || role.trim().length === 0) {
    return null;
  }

  return role.trim().toLowerCase();
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toNullableString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value : null;

const parseStoredAuth = (rawValue: string): AuthState | null => {
  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!isRecord(parsed)) {
      return null;
    }

    const token = toNullableString(parsed.token);
    const refreshToken = toNullableString(parsed.refreshToken);
    const user = isRecord(parsed.user) ? parsed.user : null;

    if (!token && !refreshToken && !user) {
      return null;
    }

    return {
      token,
      refreshToken,
      user,
      isAuthenticated: Boolean(token),
    };
  } catch {
    return null;
  }
};

export const loadStoredAuth = (): AuthState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedValue = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  return parseStoredAuth(storedValue);
};

export const getStoredTokens = (): StoredTokens => {
  const storedAuth = loadStoredAuth();

  return {
    token: storedAuth?.token ?? null,
    refreshToken: storedAuth?.refreshToken ?? null,
  };
};

export const getStoredUserRole = (): string | null => {
  const storedAuth = loadStoredAuth();
  return getRoleFromUser(storedAuth?.user ?? null);
};

export const persistAuthState = (state: AuthState): void => {
  if (typeof window === "undefined") {
    return;
  }

  if (!state.token && !state.refreshToken && !state.user) {
    clearStoredAuth();
    return;
  }

  const payload = {
    token: state.token,
    refreshToken: state.refreshToken,
    user: state.user,
    isAuthenticated: state.isAuthenticated,
  };

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
};

export const clearStoredAuth = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};
