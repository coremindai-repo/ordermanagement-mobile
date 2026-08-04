import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";

export type DashboardTabDef<K extends string> = { key: K; label: string; count: number };

export function DashboardTabBar<K extends string>({
  tabs,
  activeKey,
  onChange,
}: {
  tabs: DashboardTabDef<K>[];
  activeKey: K;
  onChange: (key: K) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {tabs.map((tab) => {
        const active = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onChange(tab.key)}
          >
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{tab.count}</Text>
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, flexShrink: 0 },
  row: { paddingHorizontal: 12, gap: 4, alignItems: "flex-start" },
  tab: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    minWidth: 74,
  },
  tabActive: { backgroundColor: colors.backgroundMuted },
  countBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.badge,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  countText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textPrimary },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
  },
  labelActive: { color: colors.textPrimary, fontFamily: fonts.semiBold },
});
