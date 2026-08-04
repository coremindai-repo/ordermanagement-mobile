import React from "react";
import { Alert } from "react-native";
import { SearchInventoryView } from "../../inventory/SearchInventoryView";
import { useNewOrderDraft } from "../NewOrderDraftContext";
import type { InventoryItem } from "../../../api/orderTypes";
import type { NewOrderScreenProps } from "../navigation";

export function ClaimInventoryScreen({ navigation }: NewOrderScreenProps<"ClaimInventory">) {
  const { draft, addClaimedItem } = useNewOrderDraft();

  const handleClaim = (item: InventoryItem) => {
    const alreadyAdded = draft.items.some(
      (existing) => existing.kind === "claimed" && existing.claimLineItemId === item.lineItemId
    );
    if (alreadyAdded) {
      Alert.alert("Already added", "This item is already part of this order.");
      return;
    }
    addClaimedItem(item);
    navigation.goBack();
  };

  return <SearchInventoryView onClaim={handleClaim} />;
}
