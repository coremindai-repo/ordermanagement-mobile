import React, { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react-native";
import { getOrderLineItems } from "../../api/workQueue";
import {
  getOutsourcingRequests,
  updateOutsourcingRequestStatus,
} from "../../api/outsourcing";
import { ApiError } from "../../api/client";
import { OrdersDashboardLayout } from "../orders/OrdersDashboardLayout";
import { FilterChipRow } from "../orders/FilterChipRow";
import { DashboardTabBar, type DashboardTabDef } from "../orders/DashboardTabBar";
import { WorkQueueItemCard } from "../stages/WorkQueueItemCard";
import { OutsourcingRequestRow } from "./OutsourcingRequestRow";
import { PlaceOutsourcingOrderModal } from "./PlaceOutsourcingOrderModal";
import { ReceiveOutsourcingModal } from "./ReceiveOutsourcingModal";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import type { OutsourcingMethod, OutsourcingRequest } from "../../api/outsourcingTypes";
import type { WorkQueueLineItem } from "../../api/workQueueTypes";

type TabKey = "newRequirement" | "placed" | "accepted" | "receivedStore" | "receivedFactory";

const TAB_LABELS: Record<TabKey, string> = {
  newRequirement: "New Requirement",
  placed: "Order Placed",
  accepted: "Order Accepted",
  receivedStore: "Received in Store",
  receivedFactory: "Received in Factory",
};

/**
 * Company Manager's vendor-level outsourcing/import flow (distinct from the factory
 * supervisor's per-item method choice, Epic 4). "New Requirement" is sourced from the
 * work-queue endpoint (items with method set but no request placed yet — see
 * OutsourceImportScreen's original comment history / CLAUDE.md §8); the other 4 tabs
 * read `GET /api/outsourcing-requests`, whose exact response shape is inferred
 * defensively — see outsourcingTypes.ts.
 */
export function OutsourceImportScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>("newRequirement");
  const [method, setMethod] = useState<OutsourcingMethod>("import");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [placeOrderVisible, setPlaceOrderVisible] = useState(false);
  const [receiveVisible, setReceiveVisible] = useState(false);
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [batchError, setBatchError] = useState<string | null>(null);

  const newRequirementQuery = useQuery({
    queryKey: ["order-line-items", "outsourcing-new", method],
    queryFn: () => getOrderLineItems({ method, status: "PENDING" }),
    enabled: activeTab === "newRequirement",
  });

  const placedQuery = useQuery({
    queryKey: ["outsourcing-requests", "placed", method],
    queryFn: () => getOutsourcingRequests({ status: "placed", method }),
    enabled: activeTab === "placed",
  });

  const acceptedQuery = useQuery({
    queryKey: ["outsourcing-requests", "accepted", method],
    queryFn: () => getOutsourcingRequests({ status: "accepted", method }),
    enabled: activeTab === "accepted",
  });

  const receivedStoreQuery = useQuery({
    queryKey: ["outsourcing-requests", "received_finished", method],
    queryFn: () => getOutsourcingRequests({ status: "received_finished", method }),
    enabled: activeTab === "receivedStore",
  });

  const receivedFactoryQuery = useQuery({
    queryKey: ["outsourcing-requests", "received_semi_finished", method],
    queryFn: () => getOutsourcingRequests({ status: "received_semi_finished", method }),
    enabled: activeTab === "receivedFactory",
  });

  const tabs: DashboardTabDef<TabKey>[] = (Object.keys(TAB_LABELS) as TabKey[]).map((key) => ({
    key,
    label: TAB_LABELS[key],
    count:
      key === "newRequirement"
        ? newRequirementQuery.data?.lineItems.length ?? 0
        : key === "placed"
          ? placedQuery.data?.requests.length ?? 0
          : key === "accepted"
            ? acceptedQuery.data?.requests.length ?? 0
            : key === "receivedStore"
              ? receivedStoreQuery.data?.requests.length ?? 0
              : receivedFactoryQuery.data?.requests.length ?? 0,
  }));

  const changeTab = (tab: TabKey) => {
    setActiveTab(tab);
    setSelected(new Set());
    setBatchError(null);
  };

  const changeMethod = (key: OutsourcingMethod) => {
    setMethod(key);
    setSelected(new Set());
  };

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeQuery =
    activeTab === "newRequirement"
      ? newRequirementQuery
      : activeTab === "placed"
        ? placedQuery
        : activeTab === "accepted"
          ? acceptedQuery
          : activeTab === "receivedStore"
            ? receivedStoreQuery
            : receivedFactoryQuery;

  const refetchActive = () => activeQuery.refetch();

  const handleAcceptSelected = async () => {
    setBatchSubmitting(true);
    setBatchError(null);
    try {
      await Promise.all(
        Array.from(selected).map((requestId) =>
          updateOutsourcingRequestStatus(requestId, { status: "accepted" })
        )
      );
      setSelected(new Set());
      refetchActive();
    } catch (err) {
      setBatchError(err instanceof ApiError ? err.message : "Could not update the selected requests.");
    } finally {
      setBatchSubmitting(false);
    }
  };

  const selectedRequestsForReceive =
    activeTab === "accepted" ? (acceptedQuery.data?.requests ?? []).filter((r) => selected.has(r.requestId)) : [];

  return (
    <OrdersDashboardLayout title="Outsource & Import">
      <DashboardTabBar tabs={tabs} activeKey={activeTab} onChange={changeTab} />

      <FilterChipRow
        options={[
          { key: "import" as const, label: "Import" },
          { key: "outsource" as const, label: "Outsource" },
        ]}
        activeKeys={new Set([method])}
        onToggle={changeMethod}
      />

      {activeQuery.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : activeQuery.isError ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>
            {activeQuery.error instanceof ApiError ? activeQuery.error.message : "Could not load."}
          </Text>
          <Pressable style={styles.retryButton} onPress={() => activeQuery.refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : activeTab === "newRequirement" ? (
        <ItemSelectionList
          items={newRequirementQuery.data?.lineItems ?? []}
          selected={selected}
          onToggle={toggleSelected}
          onSelectAll={setSelected}
          onRefresh={refetchActive}
          refreshing={newRequirementQuery.isRefetching}
          emptyMessage={`No items awaiting ${method === "import" ? "import" : "outsourcing"}.`}
        />
      ) : (
        <RequestList
          requests={
            (activeTab === "placed"
              ? placedQuery.data?.requests
              : activeTab === "accepted"
                ? acceptedQuery.data?.requests
                : activeTab === "receivedStore"
                  ? receivedStoreQuery.data?.requests
                  : receivedFactoryQuery.data?.requests) ?? []
          }
          selectable={activeTab === "placed" || activeTab === "accepted"}
          selected={selected}
          onToggle={toggleSelected}
          onRefresh={refetchActive}
          refreshing={activeQuery.isRefetching}
        />
      )}

      {batchError ? <Text style={styles.footerError}>{batchError}</Text> : null}

      {activeTab === "newRequirement" && selected.size > 0 ? (
        <View style={styles.footer}>
          <Pressable style={styles.actionButton} onPress={() => setPlaceOrderVisible(true)}>
            <Text style={styles.actionButtonText}>Place Order ({selected.size})</Text>
          </Pressable>
        </View>
      ) : null}

      {activeTab === "placed" && selected.size > 0 ? (
        <View style={styles.footer}>
          <Pressable
            style={[styles.actionButton, batchSubmitting && styles.actionButtonDisabled]}
            onPress={handleAcceptSelected}
            disabled={batchSubmitting}
          >
            {batchSubmitting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.actionButtonText}>Order Accepted ({selected.size})</Text>
            )}
          </Pressable>
        </View>
      ) : null}

      {activeTab === "accepted" && selected.size > 0 ? (
        <View style={styles.footer}>
          <Pressable style={styles.actionButton} onPress={() => setReceiveVisible(true)}>
            <Text style={styles.actionButtonText}>Arrived ({selected.size})</Text>
          </Pressable>
        </View>
      ) : null}

      <PlaceOutsourcingOrderModal
        visible={placeOrderVisible}
        method={method}
        lineItemIds={Array.from(selected)}
        onDone={() => {
          setPlaceOrderVisible(false);
          setSelected(new Set());
          refetchActive();
        }}
        onCancel={() => setPlaceOrderVisible(false)}
      />

      <ReceiveOutsourcingModal
        visible={receiveVisible}
        requests={selectedRequestsForReceive}
        onDone={() => {
          setReceiveVisible(false);
          setSelected(new Set());
          refetchActive();
        }}
        onCancel={() => setReceiveVisible(false)}
      />
    </OrdersDashboardLayout>
  );
}

function ItemSelectionList({
  items,
  selected,
  onToggle,
  onSelectAll,
  onRefresh,
  refreshing,
  emptyMessage,
}: {
  items: WorkQueueLineItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: (next: Set<string>) => void;
  onRefresh: () => void;
  refreshing: boolean;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }
  return (
    <>
      <SelectAllRow
        total={items.length}
        selectedCount={selected.size}
        onToggleAll={() =>
          onSelectAll(
            selected.size === items.length ? new Set() : new Set(items.map((i) => i.lineItemId))
          )
        }
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item.lineItemId}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.rowWrap}>
            <Pressable style={styles.rowCheckbox} onPress={() => onToggle(item.lineItemId)}>
              <View style={[styles.checkbox, selected.has(item.lineItemId) && styles.checkboxChecked]}>
                {selected.has(item.lineItemId) ? <Check size={14} color="#FFFFFF" /> : null}
              </View>
            </Pressable>
            <View style={{ flex: 1 }}>
              <WorkQueueItemCard item={item} onPress={() => onToggle(item.lineItemId)} />
            </View>
          </View>
        )}
      />
    </>
  );
}

function RequestList({
  requests,
  selectable,
  selected,
  onToggle,
  onRefresh,
  refreshing,
}: {
  requests: OutsourcingRequest[];
  selectable: boolean;
  selected: Set<string>;
  onToggle: (id: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  if (requests.length === 0) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.emptyText}>No requests in this tab.</Text>
      </View>
    );
  }
  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.requestId}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => (
        <View style={styles.rowWrap}>
          {selectable ? (
            <Pressable style={styles.rowCheckbox} onPress={() => onToggle(item.requestId)}>
              <View style={[styles.checkbox, selected.has(item.requestId) && styles.checkboxChecked]}>
                {selected.has(item.requestId) ? <Check size={14} color="#FFFFFF" /> : null}
              </View>
            </Pressable>
          ) : null}
          <View style={{ flex: 1, marginBottom: 12 }}>
            <OutsourcingRequestRow request={item} />
          </View>
        </View>
      )}
    />
  );
}

function SelectAllRow({
  total,
  selectedCount,
  onToggleAll,
}: {
  total: number;
  selectedCount: number;
  onToggleAll: () => void;
}) {
  return (
    <Pressable style={styles.selectAllRow} onPress={onToggleAll}>
      <View style={[styles.checkbox, selectedCount === total && total > 0 && styles.checkboxChecked]}>
        {selectedCount === total && total > 0 ? <Check size={14} color="#FFFFFF" /> : null}
      </View>
      <Text style={styles.selectAllText}>Select All</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  errorText: { fontFamily: fonts.medium, fontSize: 14, color: colors.danger, textAlign: "center" },
  retryButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
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
  rowWrap: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
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
  footerError: { fontFamily: fonts.medium, fontSize: 12, color: colors.danger, paddingHorizontal: 16 },
  actionButton: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  actionButtonDisabled: { opacity: 0.6 },
  actionButtonText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryText },
});
