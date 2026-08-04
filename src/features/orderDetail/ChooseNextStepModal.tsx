import React, { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { transitionLineItem } from "../../api/transitions";
import { ApiError } from "../../api/client";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import type { ProductionStep } from "../../api/orderTypes";

/** Moves the line item's overall currentStatus to the chosen step (a different action
 * from recording work against that step — see ProductionStepCard). Mirrors the design's
 * "Sent to" modal, shown whenever there's no active step but planned work remains. */
export function ChooseNextStepModal({
  visible,
  lineItemId,
  options,
  onDone,
  onCancel,
}: {
  visible: boolean;
  lineItemId: string;
  options: ProductionStep[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProceed = async () => {
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      await transitionLineItem(lineItemId, selected);
      setSelected(null);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not proceed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onCancel} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Sent to</Text>

          {options.map((step) => {
            const selectedNow = selected === step.stepName;
            return (
              <Pressable
                key={step.stepId}
                style={styles.optionRow}
                onPress={() => setSelected(step.stepName)}
              >
                <View style={[styles.radio, selectedNow && styles.radioSelected]} />
                <Text style={styles.optionLabel}>{step.stepName}</Text>
              </Pressable>
            );
          })}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.proceedButton, (!selected || submitting) && styles.proceedButtonDisabled]}
            onPress={handleProceed}
            disabled={!selected || submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.proceedText}>Proceed</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(17, 24, 39, 0.5)" },
  backdropTouchable: StyleSheet.absoluteFill,
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.textPrimary, marginBottom: 16 },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  radioSelected: { borderColor: colors.primary, borderWidth: 6 },
  optionLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
  errorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger, marginBottom: 12 },
  proceedButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  proceedButtonDisabled: { opacity: 0.5 },
  proceedText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryText },
});
