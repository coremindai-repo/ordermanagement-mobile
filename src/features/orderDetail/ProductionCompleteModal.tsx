import React, { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { transitionLineItem } from "../../api/transitions";
import { ApiError } from "../../api/client";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";

/** FINISHED is the only terminal production status (contract §5) — reached once every
 * planned step is complete. */
export function ProductionCompleteModal({
  visible,
  lineItemId,
  onDone,
  onCancel,
}: {
  visible: boolean;
  lineItemId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await transitionLineItem(lineItemId, "FINISHED");
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not complete. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onCancel} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Production Completed?</Text>
          <Text style={styles.body}>
            It looks like the item has completed all the stages that were marked.
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Pressable
            style={[styles.confirmButton, submitting && styles.confirmButtonDisabled]}
            onPress={handleComplete}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.confirmText}>Complete</Text>
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
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.textPrimary, marginBottom: 8 },
  body: { fontFamily: fonts.regular, fontSize: 15, color: colors.textSecondary, marginBottom: 20, lineHeight: 21 },
  errorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger, marginBottom: 12 },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmButtonDisabled: { opacity: 0.5 },
  confirmText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryText },
});
