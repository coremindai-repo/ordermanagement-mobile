import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useOrdersList } from "./useOrdersList";
import { AWAITING_DELIVERY_STATUSES, SENT_TO_STORE_STATUSES, IN_PROGRESS_STATUSES } from "./statusGroups";
import { OrdersDashboardLayout } from "./OrdersDashboardLayout";
import { DashboardTabBar, type DashboardTabDef } from "./DashboardTabBar";
import { FilterChipRow } from "./FilterChipRow";
import { OrderResultsList } from "./OrderResultsList";
import { GenerateInvoiceButton } from "./GenerateInvoiceButton";
import { OrderTransitionButton } from "./OrderTransitionButton";
import { formatStatus } from "../../utils/formatStatus";
import { managerLogisticsAction } from "../../utils/orderStatusGraph";
import type { OrderSummary } from "../../api/orderTypes";
import type { OrdersScreenProps } from "./navigation";

type TabKey = "awaitingDelivery" | "stock" | "custom" | "readyToInvoice" | "sentToStore";
type CustomSubFilter = "inProgress" | "new";

function sentToStoreLabel(status: string, storeName: string): string {
  if (status === "IN_TRANSIT") return `In Transit to ${storeName}`;
  if (status === "SENT_TO_STORE") return `Sent to ${storeName}`;
  return `${formatStatus(status)} — ${storeName}`;
}

export function ManagerOrdersDashboardScreen({
  navigation,
  title,
  canCreateOrders,
}: OrdersScreenProps<"OrdersDashboard"> & { title: string; canCreateOrders: boolean }) {
  const query = useOrdersList({ mine: false });
  const [activeTab, setActiveTab] = useState<TabKey>("awaitingDelivery");
  const [customSubFilter, setCustomSubFilter] = useState<Set<CustomSubFilter>>(new Set());
  const [sentToStoreFilter, setSentToStoreFilter] = useState<Set<string>>(new Set());

  const orders = query.data?.orders ?? [];

  const buckets = useMemo(() => {
    const awaitingStatuses: readonly string[] = AWAITING_DELIVERY_STATUSES;
    const sentStatuses: readonly string[] = SENT_TO_STORE_STATUSES;
    const inProgressStatuses: readonly string[] = IN_PROGRESS_STATUSES;

    return {
      awaitingDelivery: orders.filter((o) => awaitingStatuses.includes(o.currentStatus)),
      stock: orders.filter((o) => o.orderType === "stock"),
      custom: orders.filter((o) => o.orderType === "customer"),
      readyToInvoice: orders.filter((o) => o.currentStatus === "READY_TO_INVOICE"),
      sentToStore: orders.filter((o) => sentStatuses.includes(o.currentStatus)),
      inProgressStatuses,
    };
  }, [orders]);

  const tabs: DashboardTabDef<TabKey>[] = [
    { key: "awaitingDelivery", label: "Awaiting Delivery", count: buckets.awaitingDelivery.length },
    { key: "stock", label: "Stock Orders", count: buckets.stock.length },
    { key: "custom", label: "Custom Orders", count: buckets.custom.length },
    { key: "readyToInvoice", label: "Ready to Invoice", count: buckets.readyToInvoice.length },
    { key: "sentToStore", label: "Sent to Store", count: buckets.sentToStore.length },
  ];

  const sentToStoreChipOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const order of buckets.sentToStore) {
      if (!order.storeName) continue;
      const key = `${order.currentStatus}::${order.storeName}`;
      if (!seen.has(key)) {
        seen.set(key, sentToStoreLabel(order.currentStatus, order.storeName));
      }
    }
    return Array.from(seen.entries()).map(([key, label]) => ({ key, label }));
  }, [buckets.sentToStore]);

  const visibleOrders = useMemo(() => {
    if (activeTab === "custom" && customSubFilter.size > 0) {
      return buckets.custom.filter((o) => {
        const isNew = o.currentStatus === "NEW";
        const isInProgress = buckets.inProgressStatuses.includes(o.currentStatus);
        if (customSubFilter.has("new") && isNew) return true;
        if (customSubFilter.has("inProgress") && isInProgress) return true;
        return false;
      });
    }
    if (activeTab === "sentToStore" && sentToStoreFilter.size > 0) {
      return buckets.sentToStore.filter((o) =>
        sentToStoreFilter.has(`${o.currentStatus}::${o.storeName}`)
      );
    }
    return buckets[activeTab];
  }, [buckets, activeTab, customSubFilter, sentToStoreFilter]);

  const toggleCustomSubFilter = (key: CustomSubFilter) => {
    setCustomSubFilter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSentToStoreFilter = (key: string) => {
    setSentToStoreFilter((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openOrder = (order: OrderSummary) => {
    navigation.navigate("OrderDetail", { orderId: order.orderId });
  };

  return (
    <OrdersDashboardLayout
      title={title}
      onCreatePress={canCreateOrders ? () => navigation.navigate("NewOrder") : undefined}
      onBellPress={() => navigation.navigate("Notifications")}
    >
      <DashboardTabBar tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === "custom" ? (
        <FilterChipRow
          options={[
            { key: "inProgress", label: "In Progress" },
            { key: "new", label: "New" },
          ]}
          activeKeys={customSubFilter}
          onToggle={toggleCustomSubFilter}
        />
      ) : null}

      {activeTab === "sentToStore" && sentToStoreChipOptions.length > 0 ? (
        <FilterChipRow
          options={sentToStoreChipOptions}
          activeKeys={sentToStoreFilter}
          onToggle={toggleSentToStoreFilter}
        />
      ) : null}

      <View style={{ flex: 1 }}>
        <OrderResultsList
          orders={visibleOrders}
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          isRefetching={query.isRefetching}
          onRefresh={() => query.refetch()}
          onPressOrder={openOrder}
          emptyMessage="No orders in this tab."
          renderExtraAction={
            activeTab === "readyToInvoice"
              ? (order) => (
                  <GenerateInvoiceButton orderId={order.orderId} onDone={() => query.refetch()} />
                )
              : activeTab === "awaitingDelivery" || activeTab === "sentToStore"
                ? (order) => {
                    const action = managerLogisticsAction(order.currentStatus);
                    if (!action) return null;
                    return (
                      <OrderTransitionButton
                        orderId={order.orderId}
                        targetStatus={action.target}
                        label={action.label}
                        onDone={() => query.refetch()}
                      />
                    );
                  }
                : undefined
          }
        />
      </View>
    </OrdersDashboardLayout>
  );
}
