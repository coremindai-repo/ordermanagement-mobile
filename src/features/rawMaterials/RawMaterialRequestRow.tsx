import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link2, User } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import { formatStatus } from "../../utils/formatStatus";
import { summarizeItems } from "./summarizeItems";
import type { RawMaterialRequest } from "../../api/rawMaterialTypes";

/**
 * `lineItem: null` vs populated is the visibility asymmetry made visible: a caller may
 * see a mix of their own standalone requests and colleagues' item-linked ones (contract
 * §6), so each row is tagged with which kind it is rather than leaving that implicit.
 */
export function RawMaterialRequestRow({
  request,
  showItemTag = true,
  onPressItem,
}: {
  request: RawMaterialRequest;
  showItemTag?: boolean;
  onPressItem?: () => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.topRow}>
        <Text style={styles.itemsSummary} numberOfLines={2}>
          {summarizeItems(request.items)}
        </Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{formatStatus(request.status)}</Text>
        </View>
      </View>

      {showItemTag ? (
        request.lineItem ? (
          <Pressable style={styles.linkTag} onPress={onPressItem} disabled={!onPressItem}>
            <Link2 size={12} color="#166534" />
            <Text style={styles.linkTagText}>
              {request.lineItem.itemName} · {request.lineItem.orderNumber}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.standaloneTag}>
            <User size={12} color={colors.textSecondary} />
            <Text style={styles.standaloneTagText}>Standalone · {request.requestedBy.name}</Text>
          </View>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  topRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  itemsSummary: { flex: 1, fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
  statusBadge: { backgroundColor: colors.badge, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.textSecondary },
  linkTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  linkTagText: { fontFamily: fonts.semiBold, fontSize: 11, color: "#166534" },
  standaloneTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.badge,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  standaloneTagText: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.textSecondary },
});
