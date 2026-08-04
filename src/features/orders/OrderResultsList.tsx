import React from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { ApiError } from "../../api/client";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import { OrderListCard } from "./OrderListCard";
import type { OrderSummary } from "../../api/orderTypes";

export function OrderResultsList({
  orders,
  isLoading,
  isError,
  error,
  isRefetching,
  onRefresh,
  onPressOrder,
  emptyMessage = "No orders in this tab.",
  renderExtraAction,
}: {
  orders: OrderSummary[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isRefetching: boolean;
  onRefresh: () => void;
  onPressOrder: (order: OrderSummary) => void;
  emptyMessage?: string;
  renderExtraAction?: (order: OrderSummary) => React.ReactNode;
}) {
  if (isLoading) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />;
  }

  if (isError) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>
          {error instanceof ApiError ? error.message : "Could not load orders."}
        </Text>
        <Pressable style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(order) => order.orderId}
      contentContainerStyle={styles.listContent}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />}
      renderItem={({ item }) => (
        <OrderListCard
          order={item}
          onPress={() => onPressOrder(item)}
          extraAction={renderExtraAction?.(item)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  errorText: { fontFamily: fonts.medium, fontSize: 14, color: colors.danger, textAlign: "center" },
  retryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  listContent: { padding: 16, paddingBottom: 100, gap: 12 },
});
