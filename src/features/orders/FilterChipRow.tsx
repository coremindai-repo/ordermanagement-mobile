import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { X } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";

export function FilterChipRow<K extends string>({
  options,
  activeKeys,
  onToggle,
}: {
  options: { key: K; label: string }[];
  activeKeys: Set<K>;
  onToggle: (key: K) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((option) => {
        const active = activeKeys.has(option.key);
        return (
          <Pressable
            key={option.key}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onToggle(option.key)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
            {active ? <X size={14} color={colors.textPrimary} style={styles.chipIcon} /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundMuted,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipActive: { backgroundColor: colors.badge },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: colors.textPrimary, fontFamily: fonts.semiBold },
  chipIcon: { marginLeft: 6 },
});
