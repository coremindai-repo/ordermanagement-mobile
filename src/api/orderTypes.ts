import type { PhotoRef } from "./photoUpload";

/** billTo/shipTo/materials are free-form JSON by contract agreement (§4) — the app
 * sends whatever the screen captures; the backend stores it unchanged. */
export type FreeForm = Record<string, unknown>;

export type OrderType = "customer" | "stock";

export type OrderStatus =
  | "NEW"
  | "IN_PRODUCTION"
  | "READY_TO_INVOICE"
  | "READY_TO_DELIVER"
  | "KEEP_IN_FACTORY"
  | "SENT_TO_WAREHOUSE"
  | "IN_TRANSIT"
  | "SENT_TO_STORE"
  | "RECEIVED_IN_STORE"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export type ProductionMethod = "factory" | "outsource" | "import";

export type AvailabilityStatus = "available" | "pending_sale" | "sold" | null;

export type LengthUnit = "m" | "cm";

/** Structured, unlike `materials` — confirmed contract addition to support
 * filtering/aggregation in reporting (variable-arity materials stay free-form JSON;
 * dimensions/finish are fixed-shape, so they get real columns server-side). Axes are
 * Length/Breadth/Height (not L/B/W — "width" was dropped, it's a synonym of breadth
 * and left furniture without a real third axis). */
export type Dimensions = {
  lengthCm: number | null;
  breadthCm: number | null;
  heightCm: number | null;
  /** What the salesperson actually typed — cm is canonical storage, this is display-only. */
  enteredUnit: LengthUnit;
};

/** POST /api/orders sends values as typed, with the chosen unit — the backend converts
 * to cm; the app must never pre-convert (CLAUDE.md §8 / contract §4). */
export type DimensionsInput = {
  length?: number;
  breadth?: number;
  height?: number;
  unit: LengthUnit;
};

export type StepStatus = "pending" | "started" | "complete";

/** `productionSteps[].stepId` is the only source of step ids — no separate "list
 * steps" endpoint exists (contract §5). Ordered by `sequence` (planning order, not
 * renumbered when steps are appended). */
export type ProductionStep = {
  stepId: string;
  stepName: string;
  sequence: number;
  status: StepStatus;
  assignedNames: string[];
  photos: PhotoRef[];
  startedAt: string | null;
  completedAt: string | null;
};

export type OrderSummary = {
  orderId: string;
  orderNumber: string;
  orderType: OrderType;
  currentStatus: string;
  storeName: string | null;
  salespersonName: string;
  lineItemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type OrderLineItem = {
  lineItemId: string;
  itemName: string;
  description: string | null;
  currentStatus: string;
  method: ProductionMethod | null;
  /** Display string mirroring currentStatus — not a step reference, and null until
   * work starts. Use `productionSteps[].stepId` to address a specific step. */
  currentStep: string | null;
  productionSteps: ProductionStep[];
  availabilityStatus: AvailabilityStatus;
  originatingOrderId: string | null;
  originatingOrderNumber: string | null;
  dimensions: Dimensions | null;
  finish: string | null;
  /** Captured at item entry, read by the factory supervisor when choosing method
   * (contract §5). Same shape as step `photos` — short-lived read URLs. */
  referencePhotos: PhotoRef[];
  materials: FreeForm[];
};

export type OrderDetail = {
  orderId: string;
  orderNumber: string;
  orderType: OrderType;
  sohoOrderRef: string | null;
  currentStatus: string;
  createdAt: string;
  updatedAt: string;
  salesperson: { userId: string; firstName: string; lastName: string };
  store: { storeId: string; name: string; location: string | null } | null;
  billTo: FreeForm;
  shipTo: FreeForm;
  lineItems: OrderLineItem[];
};

/** One of two shapes: something to manufacture, or a claim on existing stock (§4). */
export type NewOrderLineItemInput =
  | {
      itemName: string;
      description?: string | null;
      method?: ProductionMethod | null;
      dimensions?: DimensionsInput | null;
      finish?: string | null;
      materials?: FreeForm[];
    }
  | { claimLineItemId: string };

export type CreateOrderRequest = {
  orderType: OrderType;
  storeId?: string | null;
  lineItems: NewOrderLineItemInput[];
  billTo?: FreeForm;
  shipTo?: FreeForm;
};

export type Store = {
  storeId: string;
  name: string;
  location: string | null;
};

export type InventoryItem = {
  lineItemId: string;
  productName: string;
  status: "finished" | "semi_finished";
  location: string;
  locationKind: "factory" | "warehouse" | "in_transit" | "store" | "unknown";
  method: ProductionMethod | null;
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  updatedAt: string;
};
