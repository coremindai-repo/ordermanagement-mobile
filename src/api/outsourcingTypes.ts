export type Supplier = {
  supplierId: string;
  name: string;
  contact: string | null;
  supportsOutsource: boolean;
  supportsImport: boolean;
};

export type OutsourcingMethod = "outsource" | "import";

export type OutsourcingRequestStatus =
  | "placed"
  | "accepted"
  | "received_finished"
  | "received_semi_finished";

/**
 * GET /api/outsourcing-requests response shape — confirmed against the synced contract
 * (2026-08-04). `lineItems` was the one field genuinely missing from the API at the
 * time this was first built (guessed from the analogous `GET /api/raw-material-requests`
 * shape); the guess turned out field-for-field correct once the backend added it.
 * Still parsed defensively in outsourcing.ts (wrapper-key fallback) and consumers
 * guard `lineItems` with `?? []` — belt-and-suspenders against a future shape drift,
 * not a sign this is still unconfirmed.
 */
export type OutsourcingLineItemRef = {
  lineItemId: string;
  itemName: string;
  orderId: string;
  orderNumber: string;
};

export type OutsourcingRequest = {
  requestId: string;
  method: OutsourcingMethod;
  status: OutsourcingRequestStatus;
  nextStatuses: OutsourcingRequestStatus[];
  supplier: { supplierId?: string; name?: string } | null;
  notes: string | null;
  lineItems: OutsourcingLineItemRef[];
  requestedBy: { userId: string; name: string };
  createdAt: string;
  updatedAt: string;
};
