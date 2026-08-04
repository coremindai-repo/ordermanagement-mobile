import type {
  AvailabilityStatus,
  Dimensions,
  OrderType,
  ProductionMethod,
} from "./orderTypes";
import type { PhotoRef } from "./photoUpload";

/** A production step within the work queue — same as §4's shape minus `photos` (only
 * wanted on the step screen, not a cross-order list). */
export type WorkQueueProductionStep = {
  stepId: string;
  stepName: string;
  sequence: number;
  status: "pending" | "started" | "complete";
  assignedNames: string[];
  startedAt: string | null;
  completedAt: string | null;
};

/**
 * GET /api/order-line-items entry — the §4 line-item shape trimmed (no `materials`,
 * no step `photos`) plus order context and the item's own timestamps. See contract §5
 * "GET /api/order-line-items". `originatingOrderId`/`originatingOrderNumber` are
 * non-null only for claimed semi-finished items re-entering the queue — treat as an
 * optional badge, not a guaranteed column.
 */
export type WorkQueueLineItem = {
  lineItemId: string;
  itemName: string;
  description: string | null;
  currentStatus: string;
  currentStep: string | null;
  method: ProductionMethod | null;
  availabilityStatus: AvailabilityStatus;
  originatingOrderId: string | null;
  originatingOrderNumber: string | null;
  finish: string | null;
  dimensions: Dimensions | null;
  order: {
    orderId: string;
    orderNumber: string;
    orderType: OrderType;
    currentStatus: string;
    storeName: string | null;
    salespersonName: string;
  };
  referencePhotos: PhotoRef[];
  productionSteps: WorkQueueProductionStep[];
  createdAt: string;
  updatedAt: string;
};

export type WorkQueueResponse = {
  lineItems: WorkQueueLineItem[];
  count: number;
  limit: number;
  truncated: boolean;
};
