import { apiClient } from "./client";
import type { LoginResponse } from "./types";

export function login(username: string, password: string): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>(
    "/api/auth/login",
    { username, password },
    { skipAuth: true }
  );
}

export function registerDevice(platform: "ios" | "android", pushToken: string): Promise<void> {
  return apiClient.post<void>("/api/auth/register-device", { platform, pushToken });
}
