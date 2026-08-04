import type { OrderStatus } from "../../api/orderTypes";

// See CLAUDE.md §8, "Epic 3 — dashboard tab → status mapping" for the derivation.
export const IN_PROGRESS_STATUSES: OrderStatus[] = ["NEW", "IN_PRODUCTION"];

export const AWAITING_DELIVERY_STATUSES: OrderStatus[] = [
  "READY_TO_DELIVER",
  "KEEP_IN_FACTORY",
  "SENT_TO_WAREHOUSE",
  "IN_TRANSIT",
  "SENT_TO_STORE",
  "RECEIVED_IN_STORE",
  "OUT_FOR_DELIVERY",
];

export const SENT_TO_STORE_STATUSES: OrderStatus[] = ["IN_TRANSIT", "SENT_TO_STORE"];
