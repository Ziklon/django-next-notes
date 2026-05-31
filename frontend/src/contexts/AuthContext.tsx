"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { clearTokens, getAccessToken, setTokens } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    setState({ isAuthenticated: !!getAccessToken(), isLoading: false });
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(extractError(data));
    }
    const { access, refresh } = await res.json();
    setTokens(access, refresh);
    setState({ isAuthenticated: true, isLoading: false });
  }, []);

  const logIn = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(extractError(data));
    }
    const { access, refresh } = await res.json();
    setTokens(access, refresh);
    setState({ isAuthenticated: true, isLoading: false });
  }, []);

  const logOut = useCallback(() => {
    clearTokens();
    setState({ isAuthenticated: false, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signUp, logIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

function extractError(data: Record<string, unknown>): string {
  if (typeof data.detail === "string") return data.detail;
  for (const val of Object.values(data)) {
    if (Array.isArray(val) && typeof val[0] === "string") return val[0];
    if (typeof val === "string") return val;
  }
  return "Something went wrong. Please try again.";
}
