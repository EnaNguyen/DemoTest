"use client";
import { createContext, useContext, useReducer, useCallback, ReactNode, useRef, useEffect } from "react";
import { User } from "@/app/types";

// AuthContext now uses the server JWT endpoints:
// - POST /api/auth/login -> { accessToken, user } and sets httpOnly refresh cookie
// - POST /api/auth/refresh -> { accessToken, user } rotates refresh token
// - POST /api/auth/logout -> clears refresh cookie
// Access token is kept in memory (ref). The context exposes `fetchWithAuth` which
// retries once after an automatic refresh when a request returns 401.

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; user: User | null }>;
  register: (userData: Partial<User>) => Promise<boolean>;
  logout: () => void;
  fetchWithAuth: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        error: null,
      };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const accessTokenRef = useRef<string | null>(null);

  // On mount, attempt to hydrate session via refresh cookie
  useEffect(() => {
    let mounted = true;
    (async () => {
      dispatch({ type: "LOGIN_START" });
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          accessTokenRef.current = data.accessToken || null;
          dispatch({ type: "LOGIN_SUCCESS", payload: data.user });
        } else {
          dispatch({ type: "LOGOUT" });
        }
      } catch {
        dispatch({ type: "LOGOUT" });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; user: User | null }> => {
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        dispatch({ type: "LOGIN_FAILURE", payload: err?.message || "Invalid credentials" });
        return { success: false, user: null };
      }
      const data = await res.json();
      accessTokenRef.current = data.accessToken || null;
      dispatch({ type: "LOGIN_SUCCESS", payload: data.user });
      return { success: true, user: data.user };
    } catch {
      dispatch({ type: "LOGIN_FAILURE", payload: "Network error" });
      return { success: false, user: null };
    }
  }, []);

  const register = useCallback(async (userData: Partial<User>): Promise<boolean> => {
    dispatch({ type: "LOGIN_START" });
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        dispatch({ type: "LOGIN_FAILURE", payload: err?.error || "Registration failed" });
        return false;
      }
      const data = await res.json();
      // The users API returns the created user; we don't auto-login here.
      dispatch({ type: "LOGIN_SUCCESS", payload: data.data || data });
      return true;
    } catch {
      dispatch({ type: "LOGIN_FAILURE", payload: "Network error" });
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    accessTokenRef.current = null;
    dispatch({ type: "LOGOUT" });
  }, []);

  // refresh helper (used internally)
  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (!res.ok) return false;
      const data = await res.json();
      accessTokenRef.current = data.accessToken || null;
      dispatch({ type: "LOGIN_SUCCESS", payload: data.user });
      return true;
    } catch {
      return false;
    }
  }, []);

  // fetch wrapper that injects Authorization header and attempts one refresh on 401
  const fetchWithAuth = useCallback(async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const token = accessTokenRef.current;
    const headers = new Headers(init?.headers || {});
    if (token) headers.set("Authorization", `Bearer ${token}`);
    const res = await fetch(input, { ...init, headers });
    if (res.status !== 401) return res;
    // try refresh once
    const ok = await refresh();
    if (!ok) return res;
    const newToken = accessTokenRef.current;
    const headers2 = new Headers(init?.headers || {});
    if (newToken) headers2.set("Authorization", `Bearer ${newToken}`);
    return fetch(input, { ...init, headers: headers2 });
  }, [refresh]);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        fetchWithAuth,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
