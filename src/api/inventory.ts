import { apiClient } from "./client";
import type { InventoryItem } from "./orderTypes";

export function searchInventory(params: {
  query?: string;
  status?: "finished" | "semi_finished";
}): Promise<{ items: InventoryItem[]; count: number }> {
  const query = new URLSearchParams();
  if (params.query) query.set("query", params.query);
  if (params.status) query.set("status", params.status);
  const qs = query.toString();
  return apiClient.get(`/api/inventory${qs ? `?${qs}` : ""}`);
}
