import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";

export type StatusFilter = "all" | "finished" | "semi_finished";

const OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "finished", label: "Finished" },
  { value: "semi_finished", label: "Semi-Finished" },
];

type Props = {
  visible: boolean;
  value: StatusFilter;
  onApply: (value: StatusFilter) => void;
  onClose: () => void;
};

/**
 * Category filter from the mockup (salesperson-searchinventory-filters.png) is
 * intentionally omitted — GET /api/inventory has no category taxonomy or per-category
 * counts to filter against (see CLAUDE.md §8). Status is the only real filter.
 */
export function InventoryStatusFilterSheet({ visible, value, onApply, onClose }: Props) {
  const [pending, setPending] = React.useState<StatusFilter>(value);

  React.useEffect(() => {
    if (visible) setPending(value);
  }, [visible, value]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>FILTERS</Text>
            <Pressable onPress={() => setPending("all")}>
              <Text style={styles.clearAll}>CLEAR ALL</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionLabel}>Status</Text>
          {OPTIONS.map((option) => {
            const selected = pending === option.value;
            return (
              <Pressable
                key={option.value}
                style={styles.optionRow}
                onPress={() => setPending(option.value)}
              >
                <View style={[styles.checkbox, selected && styles.checkboxChecked]}>
                  {selected ? <Check size={14} color="#FFFFFF" /> : null}
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </Pressable>
            );
          })}

          <View style={styles.footer}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>CLOSE</Text>
            </Pressable>
            <Pressable
              style={styles.applyButton}
              onPress={() => {
                onApply(pending);
                onClose();
              }}
            >
              <Text style={styles.applyButtonText}>APPLY</Text>
            </Pressable>
          </View>
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
    paddingBottom: 32,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontFamily: fonts.bold, fontSize: 14, color: colors.textPrimary, letterSpacing: 0.5 },
  clearAll: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textSecondary },
  sectionLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  optionRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
  footer: { flexDirection: "row", gap: 12, marginTop: 24 },
  closeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  closeButtonText: { fontFamily: fonts.bold, fontSize: 14, color: colors.textPrimary },
  applyButton: { flex: 1, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  applyButtonText: { fontFamily: fonts.bold, fontSize: 14, color: colors.primaryText },
});
