import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "../api/types";
import { login as loginRequest } from "../api/auth";
import { saveSession, loadSession, clearSession } from "./storage";
import { setUnauthorizedHandler } from "../api/client";
import { registerForPushNotificationsAsync } from "../push/registerForPushNotifications";

type AuthContextValue = {
  user: User | null;
  /** True while the stored session is being restored on app launch. */
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession().then((session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const response = await loginRequest(username, password);
    await saveSession(response.token, response.expiresAt, response.user);
    setUser(response.user);
    // Best-effort — a failed push registration should not block sign-in.
    registerForPushNotificationsAsync().catch(() => {});
  }, []);

  const signOut = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signIn, signOut }),
    [user, isLoading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
