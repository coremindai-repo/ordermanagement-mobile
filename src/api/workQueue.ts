import { apiClient } from "./client";
import type { ProductionMethod } from "./orderTypes";
import type { WorkQueueResponse } from "./workQueueTypes";

/**
 * Factory supervisor's work queue — every line item currently at a given production
 * status, across all orders. Ordered oldest-first; a truncated page drops the newest
 * arrivals, never the longest waits, so the response is safe to read top-down even
 * when cut off. `truncated: true` means narrow the filter or raise `limit` — there is
 * no cursor. See contract §5.
 */
export function getOrderLineItems(params?: {
  status?: string;
  method?: ProductionMethod;
  orderId?: string;
  mine?: boolean;
  limit?: number;
}): Promise<WorkQueueResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.method) query.set("method", params.method);
  if (params?.orderId) query.set("orderId", params.orderId);
  if (params?.mine) query.set("mine", "true");
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiClient.get(`/api/order-line-items${qs ? `?${qs}` : ""}`);
}
