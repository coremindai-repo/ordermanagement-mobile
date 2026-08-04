import { apiClient } from "./client";
import type { Store } from "./orderTypes";

export function transitionLineItem(
  lineItemId: string,
  targetStatus: string,
  notes?: string
): Promise<unknown> {
  return apiClient.post(`/api/order-line-items/${lineItemId}/transition`, {
    targetStatus,
    notes,
  });
}

export function transitionOrder(
  orderId: string,
  targetStatus: string,
  notes?: string
): Promise<unknown> {
  return apiClient.post(`/api/orders/${orderId}/transition`, { targetStatus, notes });
}

export function setDestinationStore(
  orderId: string,
  storeId: string
): Promise<{ orderId: string; store: Store; updatedAt: string }> {
  return apiClient.post(`/api/orders/${orderId}/destination-store`, { storeId });
}
