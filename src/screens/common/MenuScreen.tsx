import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { History, Settings, HelpCircle, LogOut, UserRound, Package, Bell, Search } from "lucide-react-native";
import { useAuth } from "../../auth/AuthContext";
import { LogoutConfirmModal } from "../../components/LogoutConfirmModal";
import { resolvePrimaryRole } from "../../navigation/resolveRole";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import type { MenuStackScreenProps } from "../../navigation/types";

const ROLE_LABELS: Record<string, string> = {
  salesperson: "Salesperson",
  factory_supervisor: "Factory Supervisor",
  store_manager: "Store Manager",
  company_manager: "Company Manager",
};

export function MenuScreen({ navigation }: MenuStackScreenProps<"Menu">) {
  const { user, signOut } = useAuth();
  const [confirmVisible, setConfirmVisible] = useState(false);

  const roleLabel = user?.roles.map((role) => ROLE_LABELS[role] ?? role).join(" · ") ?? "";
  // Which tab set the user actually sees (RootNavigator's own logic) — a Menu entry
  // should only appear here when the equivalent tab isn't already on their bottom bar.
  const primaryRole = user ? resolvePrimaryRole(user.roles) : null;

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <UserRound size={36} color={colors.textSecondary} />
          </View>
          <Text style={styles.name}>
            {user ? `${user.firstName} ${user.lastName}` : ""}
          </Text>
          <Text style={styles.roleLabel}>{roleLabel}</Text>
        </View>

        <MenuRow
          icon={<Bell size={20} color={colors.textPrimary} />}
          label="Notifications"
          onPress={() => navigation.navigate("Notifications")}
        />
        <MenuRow
          icon={<History size={20} color={colors.textPrimary} />}
          label="Order History"
          onPress={() => navigation.navigate("OrderHistory")}
        />
        {primaryRole !== "salesperson" ? (
          <MenuRow
            icon={<Search size={20} color={colors.textPrimary} />}
            label="Search Inventory"
            onPress={() => navigation.navigate("SearchInventory")}
          />
        ) : null}
        {primaryRole === "factory_supervisor" ? (
          <MenuRow
            icon={<Package size={20} color={colors.textPrimary} />}
            label="Raw Materials"
            onPress={() => navigation.navigate("RawMaterials")}
          />
        ) : null}
        <MenuRow
          icon={<Settings size={20} color={colors.textPrimary} />}
          label="Settings"
          onPress={() => navigation.navigate("Settings")}
        />
        <MenuRow
          icon={<HelpCircle size={20} color={colors.textPrimary} />}
          label="Help & Support"
          onPress={() => navigation.navigate("HelpSupport")}
        />
        <MenuRow
          icon={<LogOut size={20} color={colors.danger} />}
          label="Sign Out"
          labelColor={colors.danger}
          onPress={() => setConfirmVisible(true)}
          isLast
        />
      </ScrollView>

      <LogoutConfirmModal
        visible={confirmVisible}
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => {
          setConfirmVisible(false);
          signOut();
        }}
      />
    </View>
  );
}

function MenuRow({
  icon,
  label,
  labelColor,
  onPress,
  isLast,
}: {
  icon: React.ReactNode;
  label: string;
  labelColor?: string;
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <Pressable
      style={[styles.row, !isLast && styles.rowDivider]}
      onPress={onPress}
    >
      {icon}
      <Text style={[styles.rowLabel, labelColor ? { color: labelColor } : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 32 },
  profileHeader: { alignItems: "center", paddingVertical: 32 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.badge,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  name: { fontFamily: fonts.bold, fontSize: 20, color: colors.textPrimary },
  roleLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontFamily: fonts.medium, fontSize: 16, color: colors.textPrimary },
});
