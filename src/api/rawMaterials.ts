import { apiClient } from "./client";
import type { FreeForm } from "./orderTypes";
import type { RawMaterialRequest, RawMaterialRequestStatus } from "./rawMaterialTypes";

/**
 * Visibility is server-enforced, not client-filtered (contract §6): store_manager/
 * company_manager see everything; anyone else sees requests they raised plus
 * item-linked requests on orders they can access. A caller may see a mix of their own
 * standalone requests and colleagues' item-linked ones — `lineItem: null` vs populated
 * is how the UI should distinguish them, since both can legitimately appear together.
 */
export function getRawMaterialRequests(params?: {
  status?: RawMaterialRequestStatus;
  lineItemId?: string;
}): Promise<{ requests: RawMaterialRequest[]; count: number }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.lineItemId) query.set("lineItemId", params.lineItemId);
  const qs = query.toString();
  return apiClient.get(`/api/raw-material-requests${qs ? `?${qs}` : ""}`);
}

export function createRawMaterialRequest(body: {
  items: FreeForm[] | FreeForm;
  supplier?: FreeForm;
  notes?: string | null;
  lineItemId?: string | null;
}): Promise<{
  requestId: string;
  status: RawMaterialRequestStatus;
  nextStatus: RawMaterialRequestStatus | null;
  lineItemId: string | null;
}> {
  return apiClient.post("/api/raw-material-requests", body);
}

export function updateRawMaterialRequestStatus(
  requestId: string,
  body: { status: RawMaterialRequestStatus; supplier?: FreeForm; notes?: string | null }
): Promise<{
  requestId: string;
  previousStatus: RawMaterialRequestStatus;
  status: RawMaterialRequestStatus;
  nextStatus: RawMaterialRequestStatus | null;
  updatedAt: string;
}> {
  return apiClient.post(`/api/raw-material-requests/${requestId}/status`, body);
}

/** The chain moves one step at a time (contract §6) — skipping ahead is a 409. Store
 * manager's UI presents "Place Order" etc. as one tap even when a request starts
 * further back in the chain (e.g. `requested`, not yet `sent_to_supplier`), so this
 * walks it forward via each response's own `nextStatus` rather than hard-coding hops. */
export async function advanceRawMaterialRequest(
  requestId: string,
  currentStatus: RawMaterialRequestStatus,
  targetStatus: RawMaterialRequestStatus,
  supplier?: FreeForm
): Promise<void> {
  let status = currentStatus;
  while (status !== targetStatus) {
    const response = await updateRawMaterialRequestStatus(requestId, {
      status: nextStatusTowards(status, targetStatus),
      supplier,
    });
    status = response.status;
  }
}

const STATUS_CHAIN: RawMaterialRequestStatus[] = [
  "requested",
  "sent_to_supplier",
  "order_placed",
  "order_accepted",
  "received",
];

function nextStatusTowards(
  current: RawMaterialRequestStatus,
  target: RawMaterialRequestStatus
): RawMaterialRequestStatus {
  const currentIndex = STATUS_CHAIN.indexOf(current);
  const targetIndex = STATUS_CHAIN.indexOf(target);
  const nextIndex = Math.min(currentIndex + 1, targetIndex);
  return STATUS_CHAIN[nextIndex];
}
