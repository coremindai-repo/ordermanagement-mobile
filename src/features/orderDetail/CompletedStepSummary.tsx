import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CheckCircle2 } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import type { ProductionStep } from "../../api/orderTypes";

export function CompletedStepSummary({ step }: { step: ProductionStep }) {
  return (
    <View style={styles.row}>
      <CheckCircle2 size={18} color="#22C55E" />
      <View style={styles.textBlock}>
        <Text style={styles.title}>{step.stepName}</Text>
        {step.completedAt ? (
          <Text style={styles.subtitle}>
            Completed {new Date(step.completedAt).toLocaleDateString()}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
  },
  textBlock: { flex: 1 },
  title: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
