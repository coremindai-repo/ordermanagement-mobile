import React, { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";

export function ProcurementActionModal({
  visible,
  count,
  actionLabel,
  requiresSupplier,
  submitting,
  error,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  count: number;
  actionLabel: string;
  requiresSupplier: boolean;
  submitting: boolean;
  error: string | null;
  onConfirm: (supplierName: string) => void;
  onCancel: () => void;
}) {
  const [supplierName, setSupplierName] = useState("");
  const canConfirm = !requiresSupplier || supplierName.trim().length > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onCancel} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{actionLabel}</Text>
          <Text style={styles.subtitle}>
            {count} {count === 1 ? "request" : "requests"} selected
          </Text>

          {requiresSupplier ? (
            <>
              <Text style={styles.label}>Supplier</Text>
              <TextInput
                style={styles.input}
                placeholder="Supplier name"
                placeholderTextColor={colors.textPlaceholder}
                value={supplierName}
                onChangeText={setSupplierName}
              />
            </>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.confirmButton, (!canConfirm || submitting) && styles.confirmButtonDisabled]}
            onPress={() => onConfirm(supplierName.trim())}
            disabled={!canConfirm || submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.confirmText}>{actionLabel}</Text>
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
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  label: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  errorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger, marginBottom: 12 },
  confirmButton: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  confirmButtonDisabled: { opacity: 0.5 },
  confirmText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryText },
});
