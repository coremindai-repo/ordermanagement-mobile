import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CheckCircle2, AlertTriangle } from "lucide-react-native";
import { colors } from "../../../theme/colors";
import { fonts } from "../../../theme/typography";
import type { NewOrderScreenProps } from "../navigation";

export function OrderSubmittedScreen({
  navigation,
  route,
}: NewOrderScreenProps<"OrderSubmitted">) {
  const { orderNumber, photoFailureItemCount } = route.params;

  return (
    <View style={styles.flex}>
      <View style={styles.content}>
        <CheckCircle2 size={56} color="#22C55E" />
        <Text style={styles.title}>Order {orderNumber} submitted</Text>
        <Text style={styles.subtitle}>The order has been created.</Text>

        {photoFailureItemCount > 0 ? (
          <View style={styles.warningBanner}>
            <AlertTriangle size={18} color="#92400E" />
            <Text style={styles.warningText}>
              {photoFailureItemCount === 1
                ? "1 item's reference photos couldn't be uploaded."
                : `${photoFailureItemCount} items' reference photos couldn't be uploaded.`}{" "}
              You can retry from the order's detail screen once it's available.
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.doneButton}
          onPress={() => navigation.getParent()?.goBack()}
        >
          <Text style={styles.doneButtonText}>Back to Orders</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  title: { fontFamily: fonts.bold, fontSize: 22, color: colors.textPrimary, textAlign: "center" },
  subtitle: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary },
  warningBanner: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    alignItems: "flex-start",
  },
  warningText: { flex: 1, fontFamily: fonts.medium, fontSize: 13, color: "#92400E", lineHeight: 19 },
  footer: { padding: 16 },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  doneButtonText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryText },
});
