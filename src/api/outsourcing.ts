import { apiClient } from "./client";
import type { FreeForm } from "./orderTypes";
import type {
  OutsourcingMethod,
  OutsourcingRequest,
  OutsourcingRequestStatus,
  Supplier,
} from "./outsourcingTypes";

export function getSuppliers(params?: {
  method?: OutsourcingMethod;
}): Promise<{ suppliers: Supplier[]; count: number }> {
  const query = params?.method ? `?method=${params.method}` : "";
  return apiClient.get(`/api/suppliers${query}`);
}

/** Visibility is company_manager-only with no per-record filtering (confirmed) — every
 * request the caller can see is simply returned, unlike raw-material-requests' mixed
 * own/item-linked visibility. Defensive wrapper-key parsing since the shape isn't yet
 * in the synced contract file — see outsourcingTypes.ts. */
export async function getOutsourcingRequests(params?: {
  status?: OutsourcingRequestStatus;
  method?: OutsourcingMethod;
}): Promise<{ requests: OutsourcingRequest[] }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.method) query.set("method", params.method);
  const qs = query.toString();
  const data = await apiClient.get<{ requests?: OutsourcingRequest[] } | OutsourcingRequest[]>(
    `/api/outsourcing-requests${qs ? `?${qs}` : ""}`
  );
  return { requests: Array.isArray(data) ? data : (data.requests ?? []) };
}

export function updateOutsourcingRequestStatus(
  requestId: string,
  body: { status: OutsourcingRequestStatus; supplierId?: string | null; notes?: string | null }
): Promise<{
  requestId: string;
  status: OutsourcingRequestStatus;
  nextStatuses: OutsourcingRequestStatus[];
  lineItemsAdvanced: string[];
  requiresProductionPlan?: boolean;
}> {
  return apiClient.post(`/api/outsourcing-requests/${requestId}/status`, body);
}

/**
 * Placing the request is what sends the goods out — linked items move to
 * WITH_SUPPLIER immediately (contract §6). Every named line item must already have
 * its production plan set to this method (400 otherwise).
 */
export function createOutsourcingRequest(body: {
  method: OutsourcingMethod;
  supplierId?: string | null;
  lineItemIds: string[];
  items?: FreeForm[] | FreeForm;
  notes?: string | null;
}): Promise<{
  requestId: string;
  status: "placed";
  nextStatuses: string[];
  lineItemsAdvanced: string[];
}> {
  return apiClient.post("/api/outsourcing-requests", body);
}
