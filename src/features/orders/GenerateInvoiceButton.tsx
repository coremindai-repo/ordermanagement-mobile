import React from "react";
import { OrderTransitionButton } from "./OrderTransitionButton";

/**
 * READY_TO_INVOICE → READY_TO_DELIVER (contract §4, role-gated to store_manager/
 * company_manager). The backend notifies whoever's configured for `invoice_ready`
 * automatically — nothing else for the app to do beyond the transition itself.
 */
export function GenerateInvoiceButton({
  orderId,
  onDone,
}: {
  orderId: string;
  onDone: () => void;
}) {
  return (
    <OrderTransitionButton
      orderId={orderId}
      targetStatus="READY_TO_DELIVER"
      label="Generate Invoice"
      onDone={onDone}
    />
  );
}
