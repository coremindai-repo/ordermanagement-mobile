export type NotificationType =
  | "order_status_changed"
  | "invoice_ready"
  | "raw_material_received"
  | "item_assigned";

export type AppNotification = {
  notificationId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  orderId: string | null;
  orderNumber: string | null;
  lineItemId: string | null;
  sentAt: string;
  /** Null when recorded but never reached a device (no registered token, Expo
   * unreachable, dead token) — still shown, the in-app list is the reliable channel. */
  dispatchedAt: string | null;
};
