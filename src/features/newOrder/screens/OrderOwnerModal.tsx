import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Check } from "lucide-react-native";
import { colors } from "../../../theme/colors";
import { fonts } from "../../../theme/typography";
import type { Store } from "../../../api/orderTypes";

type Props = {
  visible: boolean;
  onCancel: () => void;
  salespersonName: string;
  stores: Store[];
  storesLoading: boolean;
  selectedStoreId: string | null;
  onSelectStore: (storeId: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
};

export function OrderOwnerModal({
  visible,
  onCancel,
  salespersonName,
  stores,
  storesLoading,
  selectedStoreId,
  onSelectStore,
  onSubmit,
  submitting,
  error,
}: Props) {
  const canSubmit = !!selectedStoreId && !submitting;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={submitting ? undefined : onCancel} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Order handled by</Text>

          <Text style={styles.label}>Salesman</Text>
          <View style={styles.readOnlyField}>
            <Text style={styles.readOnlyText}>{salespersonName}</Text>
          </View>

          <Text style={styles.label}>Showroom</Text>
          {storesLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
          ) : (
            <ScrollView style={styles.storeList} nestedScrollEnabled>
              {stores.map((store) => {
                const selected = store.storeId === selectedStoreId;
                return (
                  <Pressable
                    key={store.storeId}
                    style={[styles.storeRow, selected && styles.storeRowSelected]}
                    onPress={() => onSelectStore(store.storeId)}
                  >
                    <Text style={styles.storeName}>{store.name}</Text>
                    {selected ? <Check size={18} color={colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={onSubmit}
            disabled={!canSubmit}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.submitText}>Submit Order</Text>
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
    maxHeight: "80%",
  },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.textPrimary, marginBottom: 20 },
  label: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary, marginBottom: 8 },
  readOnlyField: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.backgroundMuted,
    marginBottom: 20,
  },
  readOnlyText: { fontFamily: fonts.regular, fontSize: 15, color: colors.textPrimary },
  storeList: { maxHeight: 160, marginBottom: 12 },
  storeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  storeRowSelected: { borderColor: colors.primary },
  storeName: { fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
  errorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger, marginBottom: 12 },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryText },
});
