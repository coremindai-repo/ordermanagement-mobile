import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import { formatStatus } from "../../utils/formatStatus";
import type { OutsourcingRequest } from "../../api/outsourcingTypes";

export function OutsourcingRequestRow({
  request,
  onPressItem,
}: {
  request: OutsourcingRequest;
  onPressItem?: (lineItemId: string, orderId: string) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.methodTag}>{request.method === "import" ? "Import" : "Outsource"}</Text>
        <Text style={styles.statusBadge}>{formatStatus(request.status)}</Text>
      </View>
      {(request.lineItems ?? []).map((item) => (
        <Pressable
          key={item.lineItemId}
          style={styles.itemRow}
          onPress={() => onPressItem?.(item.lineItemId, item.orderId)}
          disabled={!onPressItem}
        >
          <Text style={styles.itemName}>{item.itemName}</Text>
          <Text style={styles.orderRef}>{item.orderNumber}</Text>
        </Pressable>
      ))}
      {request.supplier?.name ? (
        <Text style={styles.supplierText}>Supplier: {request.supplier.name}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  methodTag: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textSecondary },
  statusBadge: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textPrimary },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  itemName: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
  orderRef: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary },
  supplierText: { fontFamily: fonts.regular, fontSize: 12, color: colors.textPlaceholder, marginTop: 6 },
});
