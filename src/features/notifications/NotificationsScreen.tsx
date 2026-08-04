import React from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Bell, FileText, Package, UserCheck } from "lucide-react-native";
import { getNotifications } from "../../api/notifications";
import { ApiError } from "../../api/client";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import type { AppNotification, NotificationType } from "../../api/notificationTypes";

const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  order_status_changed: Bell,
  invoice_ready: FileText,
  raw_material_received: Package,
  item_assigned: UserCheck,
};

/**
 * Reached from Menu (all roles) and, where a screen already sits in a stack alongside
 * Order Detail, the bell icon too. Tapping an entry with an orderId jumps to it —
 * `navigation.getParent()` is how a screen nested one level under a bottom tab (Menu)
 * reaches a sibling tab's stack.
 */
export function NotificationsScreen({ navigation }: { navigation: any }) {
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications({ limit: 100 }),
  });

  const openNotification = (notification: AppNotification) => {
    if (!notification.orderId) return;
    const target = navigation.getParent?.() ?? navigation;
    if (notification.lineItemId) {
      target.navigate("Orders", {
        screen: "ItemStatusDetail",
        params: { orderId: notification.orderId, lineItemId: notification.lineItemId },
      });
    } else {
      target.navigate("Orders", {
        screen: "OrderDetail",
        params: { orderId: notification.orderId },
      });
    }
  };

  return (
    <View style={styles.flex}>
      {query.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : query.isError ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>
            {query.error instanceof ApiError ? query.error.message : "Could not load notifications."}
          </Text>
          <Pressable style={styles.retryButton} onPress={() => query.refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : (query.data?.notifications.length ?? 0) === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      ) : (
        <FlatList
          data={query.data?.notifications ?? []}
          keyExtractor={(item) => item.notificationId}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => query.refetch()} />}
          renderItem={({ item }) => (
            <NotificationRow notification={item} onPress={() => openNotification(item)} />
          )}
        />
      )}
    </View>
  );
}

function NotificationRow({
  notification,
  onPress,
}: {
  notification: AppNotification;
  onPress: () => void;
}) {
  const Icon = TYPE_ICONS[notification.type] ?? Bell;
  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      disabled={!notification.orderId}
    >
      <View style={styles.iconWrap}>
        <Icon size={18} color={colors.textPrimary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.title}>{notification.title}</Text>
        {notification.body ? <Text style={styles.body}>{notification.body}</Text> : null}
        <View style={styles.metaRow}>
          <Text style={styles.timestamp}>{new Date(notification.sentAt).toLocaleString()}</Text>
          {!notification.dispatchedAt ? (
            <Text style={styles.undelivered}>Not delivered to device</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  errorText: { fontFamily: fonts.medium, fontSize: 14, color: colors.danger, textAlign: "center" },
  retryButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  listContent: { padding: 16, gap: 12 },
  row: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.badge,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: { flex: 1 },
  title: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textPrimary },
  body: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
  timestamp: { fontFamily: fonts.regular, fontSize: 11, color: colors.textPlaceholder },
  undelivered: { fontFamily: fonts.medium, fontSize: 11, color: "#92400E" },
});
