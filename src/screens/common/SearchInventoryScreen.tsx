import React from "react";
import { SearchInventoryView } from "../../features/inventory/SearchInventoryView";

/** Browse-only. Claiming an item into an order happens from within the New Order flow
 * (ClaimInventoryScreen reuses this same view with an onClaim handler) — see CLAUDE.md §8. */
export function SearchInventoryScreen() {
  return <SearchInventoryView />;
}
