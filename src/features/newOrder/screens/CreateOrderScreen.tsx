import React, { useLayoutEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../auth/AuthContext";
import { getStores } from "../../../api/stores";
import { ApiError } from "../../../api/client";
import { colors } from "../../../theme/colors";
import { fonts } from "../../../theme/typography";
import { useNewOrderDraft } from "../NewOrderDraftContext";
import { isAddressComplete } from "./AddressForm";
import { emptyAddress } from "../types";
import { ItemsPanel } from "./ItemsPanel";
import { BillingDeliveryPanel } from "./BillingDeliveryPanel";
import { OrderOwnerModal } from "./OrderOwnerModal";
import { submitNewOrder } from "../submitNewOrder";
import type { NewOrderScreenProps } from "../navigation";

export function CreateOrderScreen({ navigation }: NewOrderScreenProps<"CreateOrder">) {
  const { user } = useAuth();
  const { draft } = useNewOrderDraft();
  const queryClient = useQueryClient();
  const isCustomer = draft.orderType === "customer";
  const [activeTab, setActiveTab] = useState<"items" | "billing">("items");
  const [ownerModalVisible, setOwnerModalVisible] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const storesQuery = useQuery({ queryKey: ["stores"], queryFn: getStores });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isCustomer ? "Create Custom Order" : "Create Stock Order",
    });
  }, [navigation, isCustomer]);

  const hasItems = draft.items.length > 0;
  const billingComplete =
    isAddressComplete(draft.billTo ?? emptyAddress) && isAddressComplete(draft.shipTo ?? emptyAddress);

  const primaryLabel = activeTab === "items" && isCustomer ? "Next" : "Submit Order";
  const primaryEnabled = activeTab === "items" ? hasItems : hasItems && billingComplete;

  const handlePrimaryPress = () => {
    if (activeTab === "items" && isCustomer) {
      setActiveTab("billing");
      return;
    }
    setSubmitError(null);
    setOwnerModalVisible(true);
  };

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitNewOrder({ ...draft, storeId: selectedStoreId });
      const photoFailureItemCount = result.photoFailures.length;
      setOwnerModalVisible(false);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      navigation.replace("OrderSubmitted", {
        orderNumber: result.order.orderNumber,
        photoFailureItemCount,
      });
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Could not submit the order. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.flex}>
      {isCustomer ? (
        <View style={styles.tabRow}>
          <Tab label="ITEMS" active={activeTab === "items"} onPress={() => setActiveTab("items")} />
          <Tab
            label="BILLING & DELIVERY"
            active={activeTab === "billing"}
            onPress={() => setActiveTab("billing")}
          />
        </View>
      ) : null}

      <View style={styles.flex}>
        {activeTab === "items" || !isCustomer ? (
          <ItemsPanel navigation={navigation} />
        ) : (
          <BillingDeliveryPanel />
        )}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={[styles.primaryButton, !primaryEnabled && styles.primaryButtonDisabled]}
          onPress={handlePrimaryPress}
          disabled={!primaryEnabled}
        >
          <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
        </Pressable>
      </View>

      <OrderOwnerModal
        visible={ownerModalVisible}
        onCancel={() => (submitting ? undefined : setOwnerModalVisible(false))}
        salespersonName={user ? `${user.firstName} ${user.lastName}` : ""}
        stores={storesQuery.data?.stores ?? []}
        storesLoading={storesQuery.isLoading}
        selectedStoreId={selectedStoreId}
        onSelectStore={setSelectedStoreId}
        onSubmit={handleSubmitOrder}
        submitting={submitting}
        error={submitError}
      />
    </View>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  tabRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, alignItems: "center", paddingVertical: 14 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.textPrimary },
  tabText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textSecondary },
  tabTextActive: { color: colors.textPrimary },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonDisabled: { opacity: 0.4 },
  primaryButtonText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryText },
});
