import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Link2 } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import { formatStatus } from "../../utils/formatStatus";
import type { WorkQueueLineItem } from "../../api/workQueueTypes";

export function WorkQueueItemCard({
  item,
  onPress,
}: {
  item: WorkQueueLineItem;
  onPress: () => void;
}) {
  const thumb = item.referencePhotos[0];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {thumb ? <Image source={{ uri: thumb.url }} style={styles.thumb} /> : null}
      <View style={styles.body}>
        <Text style={styles.itemName}>{item.itemName}</Text>
        <Text style={styles.status}>{formatStatus(item.currentStatus)}</Text>
        <Text style={styles.orderRef}>
          {item.order.orderType === "customer" ? "Sales Order" : "Stock Order"} {item.order.orderNumber}
        </Text>
        {item.originatingOrderNumber ? (
          <View style={styles.claimedTag}>
            <Link2 size={11} color="#166534" />
            <Text style={styles.claimedTagText}>Claimed from {item.originatingOrderNumber}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  thumb: { width: 56, height: 56, borderRadius: 10, backgroundColor: colors.badge },
  body: { flex: 1, justifyContent: "center" },
  itemName: { fontFamily: fonts.bold, fontSize: 16, color: colors.textPrimary },
  status: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  orderRef: { fontFamily: fonts.regular, fontSize: 12, color: colors.textPlaceholder, marginTop: 2 },
  claimedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  claimedTagText: { fontFamily: fonts.semiBold, fontSize: 11, color: "#166534" },
});
