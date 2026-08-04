import React, { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useQueries } from "@tanstack/react-query";
import { Check } from "lucide-react-native";
import {
  getRawMaterialRequests,
  advanceRawMaterialRequest,
} from "../../api/rawMaterials";
import { ApiError } from "../../api/client";
import { OrdersDashboardLayout } from "../orders/OrdersDashboardLayout";
import { DashboardTabBar, type DashboardTabDef } from "../orders/DashboardTabBar";
import { RawMaterialRequestRow } from "./RawMaterialRequestRow";
import { ProcurementActionModal } from "./ProcurementActionModal";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import type { RawMaterialRequest, RawMaterialRequestStatus } from "../../api/rawMaterialTypes";

type TabKey = "newRequirement" | "orderPlaced" | "accepted" | "receivedInStore";

const TAB_STATUSES: Record<TabKey, RawMaterialRequestStatus[]> = {
  newRequirement: ["requested", "sent_to_supplier"],
  orderPlaced: ["order_placed"],
  accepted: ["order_accepted"],
  receivedInStore: ["received"],
};

const TAB_LABELS: Record<TabKey, string> = {
  newRequirement: "New Requirement",
  orderPlaced: "Order Placed",
  accepted: "Accepted",
  receivedInStore: "Received in Store",
};

const TAB_ACTION: Partial<Record<TabKey, { target: RawMaterialRequestStatus; label: string; requiresSupplier: boolean }>> = {
  newRequirement: { target: "order_placed", label: "Place Order", requiresSupplier: true },
  orderPlaced: { target: "order_accepted", label: "Accepted by Vendor", requiresSupplier: false },
  accepted: { target: "received", label: "Received in Store", requiresSupplier: false },
};

const ALL_STATUSES: RawMaterialRequestStatus[] = [
  "requested",
  "sent_to_supplier",
  "order_placed",
  "order_accepted",
  "received",
];

/**
 * Shared by Store Manager and Company Manager — both can raise/progress raw-material
 * requests per contract §3's role table. The mockup's 5th tab, "Sent to Factory," is
 * intentionally not built — confirmed with the client it isn't a real status, and
 * nothing server-side would drive it. See CLAUDE.md §8.
 */
export function ProcurementDashboardScreen({ navigation }: { navigation: any }) {
  const [activeTab, setActiveTab] = useState<TabKey>("newRequirement");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const statusQueries = useQueries({
    queries: ALL_STATUSES.map((status) => ({
      queryKey: ["raw-material-requests", "status", status],
      queryFn: () => getRawMaterialRequests({ status }),
    })),
  });

  const requestsByStatus = new Map<RawMaterialRequestStatus, RawMaterialRequest[]>();
  ALL_STATUSES.forEach((status, index) => {
    requestsByStatus.set(status, statusQueries[index]?.data?.requests ?? []);
  });

  const bucketFor = (tab: TabKey): RawMaterialRequest[] =>
    TAB_STATUSES[tab].flatMap((status) => requestsByStatus.get(status) ?? []);

  const tabs: DashboardTabDef<TabKey>[] = (Object.keys(TAB_LABELS) as TabKey[]).map((key) => ({
    key,
    label: TAB_LABELS[key],
    count: bucketFor(key).length,
  }));

  const isLoading = statusQueries.some((q) => q.isLoading);
  const activeItems = bucketFor(activeTab);
  const action = TAB_ACTION[activeTab];

  const toggleSelected = (requestId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(requestId)) next.delete(requestId);
      else next.add(requestId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => (prev.size === activeItems.length ? new Set() : new Set(activeItems.map((r) => r.requestId))));
  };

  const changeTab = (tab: TabKey) => {
    setActiveTab(tab);
    setSelected(new Set());
  };

  const refetchAll = () => statusQueries.forEach((q) => q.refetch());

  const handleConfirmAction = async (supplierName: string) => {
    if (!action) return;
    setSubmitting(true);
    setActionError(null);
    try {
      const supplier = supplierName ? { name: supplierName } : undefined;
      await Promise.all(
        Array.from(selected).map((requestId) => {
          const request = activeItems.find((r) => r.requestId === requestId);
          if (!request) return Promise.resolve();
          return advanceRawMaterialRequest(requestId, request.status, action.target, supplier);
        })
      );
      setActionModalVisible(false);
      setSelected(new Set());
      refetchAll();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not update the selected requests.");
    } finally {
      setSubmitting(false);
    }
  };

  const openItem = (request: RawMaterialRequest) => {
    if (!request.lineItem) return;
    navigation.navigate("Orders", {
      screen: "OrderDetail",
      params: { orderId: request.lineItem.orderId },
    });
  };

  return (
    <OrdersDashboardLayout title="Raw Material Orders">
      <DashboardTabBar tabs={tabs} activeKey={activeTab} onChange={changeTab} />

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : activeItems.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyText}>No requests in this tab.</Text>
        </View>
      ) : (
        <>
          {action ? (
            <Pressable style={styles.selectAllRow} onPress={toggleSelectAll}>
              <View style={[styles.checkbox, selected.size === activeItems.length && styles.checkboxChecked]}>
                {selected.size === activeItems.length ? <Check size={14} color="#FFFFFF" /> : null}
              </View>
              <Text style={styles.selectAllText}>Select All</Text>
            </Pressable>
          ) : null}

          <FlatList
            data={activeItems}
            keyExtractor={(item) => item.requestId}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={false} onRefresh={refetchAll} />}
            renderItem={({ item }) => (
              <View style={styles.rowWrap}>
                {action ? (
                  <Pressable style={styles.rowCheckbox} onPress={() => toggleSelected(item.requestId)}>
                    <View style={[styles.checkbox, selected.has(item.requestId) && styles.checkboxChecked]}>
                      {selected.has(item.requestId) ? <Check size={14} color="#FFFFFF" /> : null}
                    </View>
                  </Pressable>
                ) : null}
                <View style={{ flex: 1 }}>
                  <RawMaterialRequestRow request={item} onPressItem={() => openItem(item)} />
                </View>
              </View>
            )}
          />

          {action && selected.size > 0 ? (
            <View style={styles.footer}>
              <Pressable style={styles.actionButton} onPress={() => setActionModalVisible(true)}>
                <Text style={styles.actionButtonText}>
                  {action.label} ({selected.size})
                </Text>
              </Pressable>
            </View>
          ) : null}
        </>
      )}

      {action ? (
        <ProcurementActionModal
          visible={actionModalVisible}
          count={selected.size}
          actionLabel={action.label}
          requiresSupplier={action.requiresSupplier}
          submitting={submitting}
          error={actionError}
          onConfirm={handleConfirmAction}
          onCancel={() => setActionModalVisible(false)}
        />
      ) : null}
    </OrdersDashboardLayout>
  );
}

const styles = StyleSheet.create({
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  selectAllRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  selectAllText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  listContent: { padding: 16, paddingTop: 0, paddingBottom: 100 },
  rowWrap: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  rowCheckbox: { paddingTop: 16 },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  actionButtonText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryText },
});
