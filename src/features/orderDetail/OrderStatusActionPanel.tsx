import React, { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getStores } from "../../api/stores";
import { transitionOrder, setDestinationStore } from "../../api/transitions";
import { ApiError } from "../../api/client";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import { formatStatus } from "../../utils/formatStatus";
import { ORDER_STATUS_LABELS } from "../../utils/orderStatusGraph";
import type { OrderDetail, OrderStatus, Store } from "../../api/orderTypes";

/**
 * Shown on the item screen, but the underlying action is order-level (contract §4:
 * "Routing is per order, not per line item" — the whole order ships together).
 * `legalStates` is computed by the caller from the order's actual current status
 * (see orderStatusGraph.ts) rather than a fixed set — reused by both the factory
 * supervisor's post-production routing and the store/company manager's item logistics,
 * since both are "pick the next legal order status" with the same mechanics (including
 * the DESTINATION_STORE_REQUIRED → store picker flow, harmless when it never triggers).
 */
export function OrderStatusActionPanel({
  order,
  legalStates,
  title = "Item’s Current State",
  onDone,
}: {
  order: OrderDetail;
  legalStates: OrderStatus[];
  title?: string;
  onDone: () => void;
}) {
  const [selected, setSelected] = useState<OrderStatus | null>(null);
  const [storePickerVisible, setStorePickerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storesQuery = useQuery({
    queryKey: ["stores"],
    queryFn: getStores,
    enabled: storePickerVisible,
  });

  if (legalStates.length === 0) {
    return null;
  }

  const attemptTransition = async (targetStatus: OrderStatus) => {
    setSubmitting(true);
    setError(null);
    try {
      await transitionOrder(order.orderId, targetStatus);
      onDone();
    } catch (err) {
      if (err instanceof ApiError && err.code === "DESTINATION_STORE_REQUIRED") {
        setStorePickerVisible(true);
      } else {
        setError(err instanceof ApiError ? err.message : "Could not update. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = () => {
    if (selected) attemptTransition(selected);
  };

  const handleStoreSelected = async (store: Store) => {
    setSubmitting(true);
    setError(null);
    try {
      await setDestinationStore(order.orderId, store.storeId);
      setStorePickerVisible(false);
      if (selected) await attemptTransition(selected);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not set destination store.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.optionsGrid}>
        {legalStates.map((status) => {
          const isSelected = selected === status;
          return (
            <Pressable
              key={status}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => setSelected(status)}
            >
              <View style={[styles.radio, isSelected && styles.radioSelected]} />
              <Text style={styles.optionLabel}>{ORDER_STATUS_LABELS[status] ?? formatStatus(status)}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={[styles.saveButton, (!selected || submitting) && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={!selected || submitting}
      >
        {submitting ? (
          <ActivityIndicator color={colors.primaryText} />
        ) : (
          <Text style={styles.saveText}>Save</Text>
        )}
      </Pressable>

      <Modal
        visible={storePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStorePickerVisible(false)}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={styles.backdropTouchable}
            onPress={() => setStorePickerVisible(false)}
          />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Choose destination store</Text>
            {storesQuery.isLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <ScrollView style={{ maxHeight: 240 }}>
                {(storesQuery.data?.stores ?? []).map((store) => (
                  <Pressable
                    key={store.storeId}
                    style={styles.storeRow}
                    onPress={() => handleStoreSelected(store)}
                  >
                    <Text style={styles.storeName}>{store.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  sectionTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary, marginBottom: 12 },
  optionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: "45%",
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.backgroundMuted },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  radioSelected: { borderColor: colors.primary, borderWidth: 5 },
  optionLabel: { fontFamily: fonts.medium, fontSize: 13, color: colors.textPrimary },
  errorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger, marginBottom: 12 },
  saveButton: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  saveButtonDisabled: { opacity: 0.5 },
  saveText: { fontFamily: fonts.bold, fontSize: 15, color: colors.primaryText },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(17, 24, 39, 0.5)" },
  backdropTouchable: StyleSheet.absoluteFill,
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  sheetTitle: { fontFamily: fonts.bold, fontSize: 18, color: colors.textPrimary, marginBottom: 16 },
  storeRow: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
  },
  storeName: { fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
});
