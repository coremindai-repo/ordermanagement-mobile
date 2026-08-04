import React, { useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, CheckCircle2 } from "lucide-react-native";
import { getOrder } from "../../api/orders";
import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import { formatStatus } from "../../utils/formatStatus";
import { GenerateInvoiceButton } from "../orders/GenerateInvoiceButton";
import type { OrderLineItem } from "../../api/orderTypes";
import type { OrdersScreenProps } from "../orders/navigation";

export function OrderDetailScreen({ navigation, route }: OrdersScreenProps<"OrderDetail">) {
  const { orderId } = route.params;
  const { user } = useAuth();
  const query = useQuery({ queryKey: ["order", orderId], queryFn: () => getOrder(orderId) });
  const [activeTab, setActiveTab] = useState<"items" | "billing">("items");

  const canInvoice =
    !!user?.roles.some((role) => role === "store_manager" || role === "company_manager");

  useLayoutEffect(() => {
    navigation.setOptions({ title: query.data?.orderNumber ?? "Order" });
  }, [navigation, query.data?.orderNumber]);

  if (query.isLoading) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />;
  }

  if (query.isError || !query.data) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>
          {query.error instanceof ApiError ? query.error.message : "Could not load this order."}
        </Text>
        <Pressable style={styles.retryButton} onPress={() => query.refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const order = query.data;

  return (
    <View style={styles.flex}>
      <View style={styles.headerBlock}>
        <Text style={styles.orderNumber}>{order.orderNumber}</Text>
        <Text style={styles.status}>{formatStatus(order.currentStatus)}</Text>
      </View>

      <View style={styles.tabRow}>
        <Tab
          label={`Items (${order.lineItems.length})`}
          active={activeTab === "items"}
          onPress={() => setActiveTab("items")}
        />
        <Tab label="Billing Info" active={activeTab === "billing"} onPress={() => setActiveTab("billing")} />
      </View>

      {activeTab === "items" ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {order.lineItems.map((item) => (
            <LineItemRow
              key={item.lineItemId}
              item={item}
              onPress={() =>
                navigation.navigate("ItemStatusDetail", {
                  orderId: order.orderId,
                  lineItemId: item.lineItemId,
                })
              }
            />
          ))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <InfoSection title="Salesperson">
            <InfoRow
              label="Name"
              value={`${order.salesperson.firstName} ${order.salesperson.lastName}`}
            />
          </InfoSection>
          {order.store ? (
            <InfoSection title="Store">
              <InfoRow label="Name" value={order.store.name} />
              {order.store.location ? (
                <InfoRow label="Location" value={order.store.location} />
              ) : null}
            </InfoSection>
          ) : null}
          {Object.keys(order.billTo ?? {}).length > 0 ? (
            <InfoSection title="Bill To">
              {Object.entries(order.billTo).map(([key, value]) => (
                <InfoRow key={key} label={humanizeKey(key)} value={String(value ?? "")} />
              ))}
            </InfoSection>
          ) : null}
          {Object.keys(order.shipTo ?? {}).length > 0 ? (
            <InfoSection title="Ship To">
              {Object.entries(order.shipTo).map(([key, value]) => (
                <InfoRow key={key} label={humanizeKey(key)} value={String(value ?? "")} />
              ))}
            </InfoSection>
          ) : null}
        </ScrollView>
      )}

      {canInvoice && order.currentStatus === "READY_TO_INVOICE" ? (
        <View style={styles.footer}>
          <GenerateInvoiceButton orderId={order.orderId} onDone={() => query.refetch()} />
        </View>
      ) : null}
    </View>
  );
}

function LineItemRow({ item, onPress }: { item: OrderLineItem; onPress: () => void }) {
  const isFinished = item.currentStatus === "FINISHED";
  return (
    <Pressable style={styles.itemRow} onPress={onPress}>
      <View style={styles.itemRowMain}>
        <View style={styles.itemNameRow}>
          <Text style={styles.itemName}>{item.itemName}</Text>
          {isFinished ? <CheckCircle2 size={16} color="#22C55E" /> : null}
        </View>
        <Text style={styles.itemStatus}>
          {item.currentStep ? `${formatStatus(item.currentStep)} · ` : ""}
          {formatStatus(item.currentStatus)}
        </Text>
      </View>
      <ChevronRight size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

function Tab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.infoSectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  errorText: { fontFamily: fonts.medium, fontSize: 14, color: colors.danger, textAlign: "center" },
  retryButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: colors.border },
  headerBlock: { backgroundColor: colors.backgroundMuted, padding: 20 },
  orderNumber: { fontFamily: fonts.bold, fontSize: 26, color: colors.textPrimary },
  status: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  tabRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { flex: 1, alignItems: "center", paddingVertical: 14 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.textPrimary },
  tabText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textSecondary },
  tabTextActive: { color: colors.textPrimary },
  scrollContent: { padding: 16, gap: 12 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
  },
  itemRowMain: { flex: 1, marginRight: 12 },
  itemNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  itemName: { fontFamily: fonts.bold, fontSize: 16, color: colors.textPrimary },
  itemStatus: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  infoSection: { marginBottom: 8 },
  infoSectionTitle: { fontFamily: fonts.bold, fontSize: 13, color: colors.textSecondary, marginBottom: 8, textTransform: "uppercase" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  infoValue: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary, flexShrink: 1, textAlign: "right", marginLeft: 12 },
});
