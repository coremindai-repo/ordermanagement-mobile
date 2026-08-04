import React from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getOrderHistory, type OrderHistoryEntry } from "../../api/orderHistory";
import { ApiError } from "../../api/client";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import { formatStatus } from "../../utils/formatStatus";

/**
 * Scoped server-side by role (contract §10) — a salesperson sees only their own
 * orders' history regardless of what's requested, so no client-side role filtering
 * is needed here. Reachable from Menu for every role.
 */
export function OrderHistoryScreen({ navigation }: { navigation: any }) {
  const query = useQuery({
    queryKey: ["order-history"],
    queryFn: () => getOrderHistory({ limit: 200 }),
  });

  const openEntry = (entry: OrderHistoryEntry) => {
    const target = navigation.getParent?.() ?? navigation;
    if (entry.scope === "lineItem" && entry.lineItemId) {
      target.navigate("Orders", {
        screen: "ItemStatusDetail",
        params: { orderId: entry.orderId, lineItemId: entry.lineItemId },
      });
    } else {
      target.navigate("Orders", { screen: "OrderDetail", params: { orderId: entry.orderId } });
    }
  };

  return (
    <View style={styles.flex}>
      {query.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : query.isError ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>
            {query.error instanceof ApiError ? query.error.message : "Could not load order history."}
          </Text>
          <Pressable style={styles.retryButton} onPress={() => query.refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (query.data?.entries.length ?? 0) === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyText}>No history yet.</Text>
        </View>
      ) : (
        <FlatList
          data={query.data?.entries ?? []}
          keyExtractor={(item) => item.entryId}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />}
          renderItem={({ item }) => <HistoryRow entry={item} onPress={() => openEntry(item)} />}
        />
      )}
    </View>
  );
}

function HistoryRow({ entry, onPress }: { entry: OrderHistoryEntry; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.topRow}>
        <Text style={styles.orderNumber}>{entry.orderNumber}</Text>
        <Text style={styles.timestamp}>{new Date(entry.changedAt).toLocaleString()}</Text>
      </View>
      {entry.itemName ? <Text style={styles.itemName}>{entry.itemName}</Text> : null}
      <Text style={styles.statusChange}>
        {entry.fromStatus ? `${formatStatus(entry.fromStatus)} → ` : "Created as "}
        {formatStatus(entry.toStatus)}
      </Text>
      <Text style={styles.changedBy}>{entry.changedBy}</Text>
      {entry.notes ? <Text style={styles.notes}>{entry.notes}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  errorText: { fontFamily: fonts.medium, fontSize: 14, color: colors.danger, textAlign: "center" },
  retryButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  listContent: { padding: 16 },
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between" },
  orderNumber: { fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary },
  timestamp: { fontFamily: fonts.regular, fontSize: 11, color: colors.textPlaceholder },
  itemName: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  statusChange: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary, marginTop: 6 },
  changedBy: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  notes: { fontFamily: fonts.regular, fontSize: 12, color: colors.textPlaceholder, marginTop: 4, fontStyle: "italic" },
});
