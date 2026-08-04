import { apiClient } from "./client";
import type { Store } from "./orderTypes";

export function getStores(): Promise<{ stores: Store[] }> {
  return apiClient.get("/api/stores");
}
