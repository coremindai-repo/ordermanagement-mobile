import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Bell, Plus } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";

export function OrdersDashboardLayout({
  title,
  onCreatePress,
  onBellPress,
  children,
}: {
  title: string;
  onCreatePress?: () => void;
  onBellPress?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Pressable onPress={onBellPress} disabled={!onBellPress} hitSlop={8}>
          <Bell size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      {children}

      {onCreatePress ? (
        <Pressable style={styles.fab} onPress={onCreatePress}>
          <Plus size={26} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontFamily: fonts.bold, fontSize: 22, color: colors.textPrimary },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
