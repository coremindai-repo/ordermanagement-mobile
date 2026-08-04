import React, { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react-native";
import { getSuppliers, createOutsourcingRequest } from "../../api/outsourcing";
import { ApiError } from "../../api/client";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import type { OutsourcingMethod } from "../../api/outsourcingTypes";

export function PlaceOutsourcingOrderModal({
  visible,
  method,
  lineItemIds,
  onDone,
  onCancel,
}: {
  visible: boolean;
  method: OutsourcingMethod;
  lineItemIds: string[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", method],
    queryFn: () => getSuppliers({ method }),
    enabled: visible,
  });

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await createOutsourcingRequest({
        method,
        supplierId,
        lineItemIds,
        notes: notes.trim() || null,
      });
      setSupplierId(null);
      setNotes("");
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not place the order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onCancel} />
        <View style={styles.sheet}>
          <Text style={styles.title}>
            Select {method === "import" ? "Import" : "Outsource"} Vendor
          </Text>
          <Text style={styles.subtitle}>{lineItemIds.length} item(s) selected</Text>

          {suppliersQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
          ) : (
            <ScrollView style={styles.supplierList}>
              {(suppliersQuery.data?.suppliers ?? []).map((supplier) => {
                const selected = supplier.supplierId === supplierId;
                return (
                  <Pressable
                    key={supplier.supplierId}
                    style={[styles.supplierRow, selected && styles.supplierRowSelected]}
                    onPress={() => setSupplierId(supplier.supplierId)}
                  >
                    <Text style={styles.supplierName}>{supplier.name}</Text>
                    {selected ? <Check size={18} color={colors.primary} /> : null}
                  </Pressable>
                );
              })}
              {(suppliersQuery.data?.suppliers.length ?? 0) === 0 ? (
                <Text style={styles.emptyText}>No suppliers configured for {method}.</Text>
              ) : null}
            </ScrollView>
          )}

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.input}
            placeholder="Optional"
            placeholderTextColor={colors.textPlaceholder}
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handlePlaceOrder}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.submitText}>Place Order</Text>
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
    maxHeight: "85%",
  },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.textPrimary, marginBottom: 4 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  supplierList: { maxHeight: 220, marginBottom: 12 },
  supplierRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  supplierRowSelected: { borderColor: colors.primary },
  supplierName: { fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, paddingVertical: 12 },
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
    minHeight: 48,
  },
  errorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger, marginBottom: 12 },
  submitButton: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  submitButtonDisabled: { opacity: 0.5 },
  submitText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryText },
});
