import type { OrderStatus, OrderType } from "../api/orderTypes";

/**
 * Only the moves factory_supervisor is permitted to make (contract §3: "Move an order
 * out of production" and "Dispatch (→ IN_TRANSIT)"). Everything from SENT_TO_STORE
 * onward is store_manager/company_manager's job and isn't offered here. Computed
 * dynamically rather than showing all 5 mockup options at once, since the v4 status
 * graph only allows one hop at a time and IN_TRANSIT additionally needs a destination
 * store set first (CLAUDE.md §8).
 */
export function supervisorLegalNextStatuses(
  currentStatus: string,
  orderType: OrderType,
  hasDestinationStore: boolean
): OrderStatus[] {
  switch (currentStatus) {
    case "IN_PRODUCTION":
      return orderType === "customer"
        ? ["READY_TO_INVOICE"]
        : ["KEEP_IN_FACTORY", "SENT_TO_WAREHOUSE"];
    case "READY_TO_DELIVER":
      return ["KEEP_IN_FACTORY", "SENT_TO_WAREHOUSE"];
    case "KEEP_IN_FACTORY":
      return hasDestinationStore ? ["SENT_TO_WAREHOUSE", "IN_TRANSIT"] : ["SENT_TO_WAREHOUSE"];
    case "SENT_TO_WAREHOUSE":
      return hasDestinationStore ? ["IN_TRANSIT"] : [];
    default:
      return [];
  }
}

/**
 * The moves store_manager/company_manager are permitted to make once an order has
 * reached the store — contract §3's "Store-side movements through DELIVERED". Confirmed
 * order-level, not line-item (2026-08-04 backend cross-check of both the order-status
 * table and destination-store note, contract §4). `IN_TRANSIT → SENT_TO_STORE` is
 * deliberately not offered here — no design screen or CLAUDE.md action names a manager
 * step for it, so it's treated as covered by the supervisor's dispatch rather than a
 * separate confirmation.
 */
export function managerLegalNextStatuses(currentStatus: string): OrderStatus[] {
  switch (currentStatus) {
    case "SENT_TO_STORE":
      return ["RECEIVED_IN_STORE"];
    case "RECEIVED_IN_STORE":
      return ["OUT_FOR_DELIVERY"];
    case "OUT_FOR_DELIVERY":
      return ["DELIVERED"];
    default:
      return [];
  }
}

const MANAGER_LOGISTICS_ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  RECEIVED_IN_STORE: "Arrived in Store",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Mark Delivered",
};

/** Single-hop version of managerLegalNextStatuses for compact UI (dashboard cards) —
 * every status in this range has exactly one legal next move, so a full options panel
 * (as used on the item screen) would be overkill there. */
export function managerLogisticsAction(
  currentStatus: string
): { target: OrderStatus; label: string } | null {
  const [target] = managerLegalNextStatuses(currentStatus);
  if (!target) return null;
  return { target, label: MANAGER_LOGISTICS_ACTION_LABELS[target] ?? target };
}

export const ORDER_STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  KEEP_IN_FACTORY: "In Factory",
  SENT_TO_WAREHOUSE: "In Warehouse",
  IN_TRANSIT: "In Transit",
  READY_TO_INVOICE: "Ready to Invoice",
  RECEIVED_IN_STORE: "Received in Store",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
};
