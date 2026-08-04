import React from "react";
import { View } from "react-native";
import { useOrdersList } from "./useOrdersList";
import { OrdersDashboardLayout } from "./OrdersDashboardLayout";
import { OrderResultsList } from "./OrderResultsList";
import type { OrderSummary } from "../../api/orderTypes";
import type { OrdersScreenProps } from "./navigation";

/**
 * Stopgap flat list (no tabs) — the real "Stages" dashboard (items grouped by
 * production step) needs a line-item-listing-by-step endpoint the contract doesn't
 * document yet (see CLAUDE.md §8). This just gets the supervisor to an order/item so
 * the method-choice screen is reachable in the meantime. factory_supervisor sees all
 * orders per contract §3, so `mine: false`; no order-creation FAB — not in that role's
 * permitted actions.
 */
export function SupervisorOrdersDashboardScreen({
  navigation,
}: OrdersScreenProps<"OrdersDashboard">) {
  const query = useOrdersList({ mine: false });

  const openOrder = (order: OrderSummary) => {
    navigation.navigate("OrderDetail", { orderId: order.orderId });
  };

  return (
    <OrdersDashboardLayout
      title="All Orders"
      onBellPress={() => navigation.navigate("Notifications")}
    >
      <View style={{ flex: 1 }}>
        <OrderResultsList
          orders={query.data?.orders ?? []}
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          isRefetching={query.isRefetching}
          onRefresh={() => query.refetch()}
          onPressOrder={openOrder}
          emptyMessage="No orders yet."
        />
      </View>
    </OrdersDashboardLayout>
  );
}
