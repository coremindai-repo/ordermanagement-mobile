import { apiClient } from "./client";

export type OrderHistoryEntry = {
  entryId: string;
  scope: "order" | "lineItem";
  orderId: string;
  orderNumber: string;
  lineItemId: string | null;
  itemName: string | null;
  fromStatus: string | null;
  toStatus: string;
  notes: string | null;
  changedBy: string;
  changedAt: string;
};

/** Order-level and line-item-level history are one merged chronology, newest first
 * (contract §10) — `scope` distinguishes them, not separate lists to interleave. */
export function getOrderHistory(params?: {
  orderId?: string;
  from?: string;
  to?: string;
  limit?: number;
}): Promise<{ entries: OrderHistoryEntry[]; count: number }> {
  const query = new URLSearchParams();
  if (params?.orderId) query.set("orderId", params.orderId);
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiClient.get(`/api/order-history${qs ? `?${qs}` : ""}`);
}
