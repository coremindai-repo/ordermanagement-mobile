import { apiClient } from "./client";
import type { CreateOrderRequest, OrderDetail, OrderSummary } from "./orderTypes";

/**
 * No `status`/`type`/`tab` filters — dashboards derive every tab client-side from one
 * full fetch of the caller's visible orders (see CLAUDE.md §8, "dashboard tab → status
 * mapping"), since several tabs span more than one status and `status` only takes one
 * value. `mine=true` for roles restricted to their own orders (salesperson);
 * omitted for roles that see everything (store_manager, company_manager — contract §3).
 */
export function getOrdersList(params: { mine: boolean }): Promise<{
  orders: OrderSummary[];
  count: number;
}> {
  const query = params.mine ? "?mine=true" : "";
  return apiClient.get(`/api/orders${query}`);
}

export function getOrder(orderId: string): Promise<OrderDetail> {
  return apiClient.get(`/api/orders/${orderId}`);
}

export function createOrder(request: CreateOrderRequest): Promise<OrderDetail> {
  return apiClient.post("/api/orders", request);
}
