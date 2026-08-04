import { apiClient } from "./client";
import type { AppNotification } from "./notificationTypes";

/** Always scoped to the caller server-side — no role sees another user's notifications. */
export function getNotifications(params?: {
  limit?: number;
}): Promise<{ notifications: AppNotification[]; count: number }> {
  const query = params?.limit ? `?limit=${params.limit}` : "";
  return apiClient.get(`/api/notifications${query}`);
}
