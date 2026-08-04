import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import { formatStatus } from "../../utils/formatStatus";
import type { OrderSummary } from "../../api/orderTypes";

export function OrderListCard({
  order,
  onPress,
  extraAction,
}: {
  order: OrderSummary;
  onPress: () => void;
  /** Tab-specific action (e.g. "Generate Invoice" on Ready to Invoice) — kept out of
   * this shared card's own logic so it stays generic across every dashboard that uses it. */
  extraAction?: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onPress}>
        <View style={styles.topRow}>
          <Text style={styles.orderNumber}>{order.orderNumber}</Text>
          <Text style={styles.itemCount}>
            {order.lineItemCount} {order.lineItemCount === 1 ? "item" : "items"}
          </Text>
        </View>
        <Text style={styles.status}>{formatStatus(order.currentStatus)}</Text>
        <Text style={styles.meta}>
          {order.orderType === "customer" ? "Customer order" : "Stock order"}
          {order.storeName ? ` · ${order.storeName}` : ""}
        </Text>
      </Pressable>
      {extraAction ? <View style={styles.actionRow}>{extraAction}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  orderNumber: { fontFamily: fonts.bold, fontSize: 20, color: colors.textPrimary },
  itemCount: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
  status: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary, marginTop: 4 },
  meta: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  actionRow: { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
});
