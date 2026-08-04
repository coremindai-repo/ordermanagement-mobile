import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import { useOrdersList } from "./useOrdersList";
import { IN_PROGRESS_STATUSES, AWAITING_DELIVERY_STATUSES } from "./statusGroups";
import { OrdersDashboardLayout } from "./OrdersDashboardLayout";
import { DashboardTabBar, type DashboardTabDef } from "./DashboardTabBar";
import { FilterChipRow } from "./FilterChipRow";
import { OrderResultsList } from "./OrderResultsList";
import type { OrderSummary, OrderType } from "../../api/orderTypes";
import type { OrdersScreenProps } from "./navigation";

type TabKey = "custom" | "stock" | "inProgress" | "readyToInvoice" | "awaitingDelivery";

export function OrdersDashboardScreen({ navigation }: OrdersScreenProps<"OrdersDashboard">) {
  const { user } = useAuth();
  const query = useOrdersList({ mine: true });
  const [activeTab, setActiveTab] = useState<TabKey>("custom");
  const [inProgressTypeFilter, setInProgressTypeFilter] = useState<Set<OrderType>>(new Set());

  const orders = query.data?.orders ?? [];

  const buckets = useMemo(() => {
    const custom = orders.filter((o) => o.orderType === "customer");
    const stock = orders.filter((o) => o.orderType === "stock");
    const inProgressStatuses: readonly string[] = IN_PROGRESS_STATUSES;
    const awaitingDeliveryStatuses: readonly string[] = AWAITING_DELIVERY_STATUSES;
    const inProgress = orders.filter((o) => inProgressStatuses.includes(o.currentStatus));
    const readyToInvoice = orders.filter((o) => o.currentStatus === "READY_TO_INVOICE");
    const awaitingDelivery = orders.filter((o) => awaitingDeliveryStatuses.includes(o.currentStatus));
    return { custom, stock, inProgress, readyToInvoice, awaitingDelivery };
  }, [orders]);

  const tabs: DashboardTabDef<TabKey>[] = [
    { key: "custom", label: "Custom Orders", count: buckets.custom.length },
    { key: "stock", label: "Stock Orders", count: buckets.stock.length },
    { key: "inProgress", label: "In Progress", count: buckets.inProgress.length },
    { key: "readyToInvoice", label: "Ready to Invoice", count: buckets.readyToInvoice.length },
    { key: "awaitingDelivery", label: "Awaiting Delivery", count: buckets.awaitingDelivery.length },
  ];

  const visibleOrders = useMemo(() => {
    const base = buckets[activeTab];
    if (activeTab === "inProgress" && inProgressTypeFilter.size > 0) {
      return base.filter((o) => inProgressTypeFilter.has(o.orderType));
    }
    return base;
  }, [buckets, activeTab, inProgressTypeFilter]);

  const toggleInProgressType = (type: OrderType) => {
    setInProgressTypeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const openOrder = (order: OrderSummary) => {
    navigation.navigate("OrderDetail", { orderId: order.orderId });
  };

  return (
    <OrdersDashboardLayout
      title={user ? `${user.firstName}'s orders` : "Orders"}
      onCreatePress={() => navigation.navigate("NewOrder")}
      onBellPress={() => navigation.navigate("Notifications")}
    >
      <DashboardTabBar tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {activeTab === "inProgress" ? (
        <FilterChipRow
          options={[
            { key: "customer", label: "Customer Order" },
            { key: "stock", label: "Stock Order" },
          ]}
          activeKeys={inProgressTypeFilter}
          onToggle={toggleInProgressType}
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
        />
      </View>
    </OrdersDashboardLayout>
  );
}
