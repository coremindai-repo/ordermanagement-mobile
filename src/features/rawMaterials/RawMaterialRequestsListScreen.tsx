import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react-native";
import { getRawMaterialRequests } from "../../api/rawMaterials";
import { ApiError } from "../../api/client";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import { RawMaterialRequestRow } from "./RawMaterialRequestRow";
import { CreateRawMaterialRequestModal } from "./CreateRawMaterialRequestModal";
import type { RawMaterialRequest } from "../../api/rawMaterialTypes";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MenuStackParamList } from "../../navigation/types";

/**
 * Visibility is server-scoped (contract §6) — a factory_supervisor sees their own
 * standalone requests plus colleagues' item-linked ones, so the list is a genuine mix.
 * Each row's tag (RawMaterialRequestRow) is what makes that asymmetry read as
 * intentional rather than a broken/incomplete list.
 */
export function RawMaterialRequestsListScreen({
  navigation,
}: NativeStackScreenProps<MenuStackParamList, "RawMaterials">) {
  const [createVisible, setCreateVisible] = useState(false);
  const query = useQuery({
    queryKey: ["raw-material-requests", "all"],
    queryFn: () => getRawMaterialRequests(),
  });

  const openItem = (request: RawMaterialRequest) => {
    if (!request.lineItem) return;
    // Cross-tab jump to a sibling tab's stack — Orders isn't part of this stack's own
    // param list, so this intentionally steps outside strict typing.
    (navigation.getParent() as any)?.navigate("Orders", {
      screen: "OrderDetail",
      params: { orderId: request.lineItem.orderId },
    });
  };

  return (
    <View style={styles.flex}>
      {query.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : query.isError ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>
            {query.error instanceof ApiError ? query.error.message : "Could not load requests."}
          </Text>
          <Pressable style={styles.retryButton} onPress={() => query.refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (query.data?.requests.length ?? 0) === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyText}>No raw material requests yet.</Text>
        </View>
      ) : (
        <FlatList
          data={query.data?.requests ?? []}
          keyExtractor={(request) => request.requestId}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />
          }
          renderItem={({ item }) => (
            <RawMaterialRequestRow request={item} onPressItem={() => openItem(item)} />
          )}
        />
      )}

      <Pressable style={styles.fab} onPress={() => setCreateVisible(true)}>
        <Plus size={26} color="#FFFFFF" />
      </Pressable>

      <CreateRawMaterialRequestModal
        visible={createVisible}
        onCreated={() => {
          setCreateVisible(false);
          query.refetch();
        }}
        onCancel={() => setCreateVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  errorText: { fontFamily: fonts.medium, fontSize: 14, color: colors.danger, textAlign: "center" },
  retryButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  listContent: { padding: 16, paddingBottom: 100 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
