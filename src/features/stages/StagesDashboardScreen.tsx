import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useQueries, useQuery } from "@tanstack/react-query";
import { getProductionStepsTemplate } from "../../api/production";
import { getOrderLineItems } from "../../api/workQueue";
import { ApiError } from "../../api/client";
import { OrdersDashboardLayout } from "../orders/OrdersDashboardLayout";
import { DashboardTabBar, type DashboardTabDef } from "../orders/DashboardTabBar";
import { WorkQueueItemCard } from "./WorkQueueItemCard";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import type { WorkQueueLineItem } from "../../api/workQueueTypes";
import type { OrdersScreenProps } from "../orders/navigation";

type StageTab = { key: string; label: string };

export function StagesDashboardScreen({ navigation }: OrdersScreenProps<"StagesDashboard">) {
  const templateQuery = useQuery({
    queryKey: ["production-steps-template"],
    queryFn: getProductionStepsTemplate,
  });

  const tabs: StageTab[] = useMemo(() => {
    if (!templateQuery.data) return [];
    return [
      { key: templateQuery.data.initialStatus, label: "New Items" },
      ...templateQuery.data.steps.map((step) => ({ key: step.code, label: step.name })),
      { key: "FINISHED", label: "Finished" },
    ];
  }, [templateQuery.data]);

  const [activeTab, setActiveTab] = useState<string | null>(null);
  useEffect(() => {
    if (!activeTab && tabs.length > 0) setActiveTab(tabs[0].key);
  }, [tabs, activeTab]);

  const tabQueries = useQueries({
    queries: tabs.map((tab) => ({
      queryKey: ["order-line-items", tab.key],
      queryFn: () => getOrderLineItems({ status: tab.key }),
    })),
  });

  const activeIndex = tabs.findIndex((tab) => tab.key === activeTab);
  const activeQuery = activeIndex >= 0 ? tabQueries[activeIndex] : undefined;

  const tabDefs: DashboardTabDef<string>[] = tabs.map((tab, index) => ({
    key: tab.key,
    label: tab.label,
    count: tabQueries[index]?.data?.count ?? 0,
  }));

  const openItem = (item: WorkQueueLineItem) => {
    navigation.navigate("ItemStatusDetail", {
      orderId: item.order.orderId,
      lineItemId: item.lineItemId,
    });
  };

  return (
    <OrdersDashboardLayout
      title="Sales Items"
      onBellPress={() => navigation.navigate("Notifications")}
    >
      {templateQuery.isLoading || !activeTab ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : templateQuery.isError ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>
            {templateQuery.error instanceof ApiError
              ? templateQuery.error.message
              : "Could not load production steps."}
          </Text>
        </View>
      ) : (
        <>
          <DashboardTabBar tabs={tabDefs} activeKey={activeTab} onChange={setActiveTab} />

          {activeQuery?.data?.truncated ? (
            <View style={styles.truncatedBanner}>
              <Text style={styles.truncatedText}>
                Showing the oldest {activeQuery.data.limit} — narrow with a more specific
                filter to see the rest.
              </Text>
            </View>
          ) : null}

          <View style={{ flex: 1 }}>
            {activeQuery?.isLoading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
            ) : activeQuery?.isError ? (
              <View style={styles.centerState}>
                <Text style={styles.errorText}>
                  {activeQuery.error instanceof ApiError
                    ? activeQuery.error.message
                    : "Could not load this stage."}
                </Text>
                <Pressable style={styles.retryButton} onPress={() => activeQuery.refetch()}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </Pressable>
              </View>
            ) : (activeQuery?.data?.lineItems.length ?? 0) === 0 ? (
              <View style={styles.centerState}>
                <Text style={styles.emptyText}>No items at this stage.</Text>
              </View>
            ) : (
              <FlatList
                data={activeQuery?.data?.lineItems ?? []}
                keyExtractor={(item) => item.lineItemId}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={!!activeQuery?.isRefetching}
                    onRefresh={() => activeQuery?.refetch()}
                  />
                }
                renderItem={({ item }) => (
                  <WorkQueueItemCard item={item} onPress={() => openItem(item)} />
                )}
              />
            )}
          </View>
        </>
      )}
    </OrdersDashboardLayout>
  );
}

const styles = StyleSheet.create({
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  errorText: { fontFamily: fonts.medium, fontSize: 14, color: colors.danger, textAlign: "center" },
  retryButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  listContent: { padding: 16, paddingBottom: 100, gap: 12 },
  truncatedBanner: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#FEF3C7",
    borderRadius: 10,
    padding: 12,
  },
  truncatedText: { fontFamily: fonts.medium, fontSize: 12, color: "#92400E" },
});
