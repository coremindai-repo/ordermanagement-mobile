import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, SlidersHorizontal, Search as SearchIcon } from "lucide-react-native";
import { searchInventory } from "../../api/inventory";
import { ApiError } from "../../api/client";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import type { InventoryItem } from "../../api/orderTypes";
import { InventoryStatusFilterSheet, type StatusFilter } from "./InventoryStatusFilterSheet";

type Props = {
  /** When provided, each result row gets a "Claim" action instead of being read-only. */
  onClaim?: (item: InventoryItem) => void;
};

export function SearchInventoryView({ onClaim }: Props) {
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [sortAscending, setSortAscending] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(queryText.trim()), 300);
    return () => clearTimeout(timeout);
  }, [queryText]);

  const query = useQuery({
    queryKey: ["inventory", debouncedQuery, statusFilter],
    queryFn: () =>
      searchInventory({
        query: debouncedQuery || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const items = useMemo(() => {
    const list = query.data?.items ?? [];
    const sorted = [...list].sort((a, b) => a.productName.localeCompare(b.productName));
    return sortAscending ? sorted : sorted.reverse();
  }, [query.data, sortAscending]);

  return (
    <View style={styles.flex}>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <SearchIcon size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by product name..."
            placeholderTextColor={colors.textPlaceholder}
            value={queryText}
            onChangeText={setQueryText}
            autoCapitalize="none"
          />
        </View>
        <Pressable style={styles.iconButton} onPress={() => setSortAscending((prev) => !prev)}>
          <ArrowUpDown size={18} color={colors.textPrimary} />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={() => setFilterSheetVisible(true)}>
          <SlidersHorizontal size={18} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>Results ({items.length})</Text>
        <Text style={styles.sortedBy}>Sorted by Name</Text>
      </View>

      {query.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : query.isError ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>
            {query.error instanceof ApiError ? query.error.message : "Could not load inventory."}
          </Text>
          <Pressable style={styles.retryButton} onPress={() => query.refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyText}>No matching items in stock.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.lineItemId}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />
          }
          renderItem={({ item }) => <InventoryRow item={item} onClaim={onClaim} />}
        />
      )}

      <InventoryStatusFilterSheet
        visible={filterSheetVisible}
        value={statusFilter}
        onApply={setStatusFilter}
        onClose={() => setFilterSheetVisible(false)}
      />
    </View>
  );
}

function InventoryRow({
  item,
  onClaim,
}: {
  item: InventoryItem;
  onClaim?: (item: InventoryItem) => void;
}) {
  const isFinished = item.status === "finished";
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <View style={[styles.statusBadge, isFinished ? styles.statusFinished : styles.statusSemi]}>
          <Text style={[styles.statusText, isFinished ? styles.statusTextFinished : styles.statusTextSemi]}>
            {isFinished ? "Finished" : "Semi-Finished"}
          </Text>
        </View>
      </View>
      <Text style={styles.locationText}>{item.location}</Text>
      <Text style={styles.orderRefText}>From {item.orderNumber}</Text>
      {onClaim ? (
        <Pressable style={styles.claimButton} onPress={() => onClaim(item)}>
          <Text style={styles.claimButtonText}>Claim for this order</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  searchRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 16 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.backgroundMuted,
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, paddingVertical: 12, fontFamily: fonts.regular, fontSize: 15, color: colors.textPrimary },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.backgroundMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  resultsCount: { fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary },
  sortedBy: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  errorText: { fontFamily: fonts.medium, fontSize: 14, color: colors.danger, textAlign: "center" },
  retryButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  listContent: { padding: 16, paddingTop: 0, gap: 12 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
  },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  itemName: { flex: 1, fontFamily: fonts.bold, fontSize: 16, color: colors.textPrimary, marginRight: 8 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusFinished: { backgroundColor: "#DCFCE7" },
  statusSemi: { backgroundColor: "#FEF3C7" },
  statusText: { fontFamily: fonts.semiBold, fontSize: 11 },
  statusTextFinished: { color: "#166534" },
  statusTextSemi: { color: "#92400E" },
  locationText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  orderRefText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textPlaceholder, marginTop: 2 },
  claimButton: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  claimButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primaryText },
});
