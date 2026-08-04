import type { FreeForm } from "./orderTypes";

export type RawMaterialRequestStatus =
  | "requested"
  | "sent_to_supplier"
  | "order_placed"
  | "order_accepted"
  | "received";

/** Present only when the request is linked to a specific item (contract §6) — a
 * standalone stock-level request has `lineItem: null`. */
export type RawMaterialRequestLineItemRef = {
  lineItemId: string;
  itemName: string;
  currentStatus: string;
  orderId: string;
  orderNumber: string;
};

export type RawMaterialRequest = {
  requestId: string;
  items: FreeForm[] | FreeForm;
  status: RawMaterialRequestStatus;
  nextStatus: RawMaterialRequestStatus | null;
  supplier: FreeForm;
  notes: string | null;
  lineItem: RawMaterialRequestLineItemRef | null;
  requestedBy: { userId: string; name: string };
  createdAt: string;
  updatedAt: string;
};
