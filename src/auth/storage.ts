import * as SecureStore from "expo-secure-store";
import type { User } from "../api/types";

const TOKEN_KEY = "auth_token";
const EXPIRES_AT_KEY = "auth_expires_at";
const USER_KEY = "auth_user";

export async function saveSession(token: string, expiresAt: string, user: User): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, token),
    SecureStore.setItemAsync(EXPIRES_AT_KEY, expiresAt),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

/** Returns the stored session if present and not expired, clearing it otherwise. */
export async function loadSession(): Promise<{ token: string; user: User } | null> {
  const [token, expiresAt, userJson] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(EXPIRES_AT_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ]);

  if (!token || !expiresAt || !userJson) {
    return null;
  }

  if (new Date(expiresAt).getTime() <= Date.now()) {
    await clearSession();
    return null;
  }

  return { token, user: JSON.parse(userJson) as User };
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(EXPIRES_AT_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
}
