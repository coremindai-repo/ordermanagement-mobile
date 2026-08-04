import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Plus, Search } from "lucide-react-native";
import { colors } from "../../../theme/colors";
import { fonts } from "../../../theme/typography";
import { useNewOrderDraft } from "../NewOrderDraftContext";
import type { DraftItem } from "../types";
import type { NewOrderScreenProps } from "../navigation";

export function ItemsPanel({ navigation }: { navigation: NewOrderScreenProps<"CreateOrder">["navigation"] }) {
  const { draft, removeItem } = useNewOrderDraft();

  return (
    <View style={styles.flex}>
      {draft.items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Add items to this order.</Text>
        </View>
      ) : (
        <FlatList
          data={draft.items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onEdit={() => navigation.navigate("ItemEntry", { editItemId: item.id })}
              onDelete={() => removeItem(item.id)}
            />
          )}
        />
      )}

      <View style={styles.fabColumn}>
        <Pressable
          style={styles.secondaryFab}
          onPress={() => navigation.navigate("ClaimInventory")}
        >
          <Search size={20} color={colors.textPrimary} />
        </Pressable>
        <Pressable style={styles.fab} onPress={() => navigation.navigate("ItemEntry", undefined)}>
          <Plus size={26} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

function ItemCard({
  item,
  onEdit,
  onDelete,
}: {
  item: DraftItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (item.kind === "claimed") {
    return (
      <View style={styles.card}>
        <View style={styles.badgeRow}>
          <Badge label="Available in Store" />
          {item.status === "semi_finished" ? (
            <Badge label="Needs further production" tone="warning" />
          ) : null}
        </View>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Row label="Location" value={item.location} />
        <View style={styles.cardActions}>
          <Pressable style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteButtonText}>Remove</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.badgeRow}>{item.priority ? <Badge label="Priority" /> : null}</View>
      <Text style={styles.itemName}>{item.itemName}</Text>
      <Row label="Quantity" value={String(item.quantity)} />
      <Row
        label="Dimensions"
        value={`${item.dimensions.length || "0"} × ${item.dimensions.breadth || "0"} × ${
          item.dimensions.height || "0"
        } ${item.dimensions.unit}`}
      />
      {item.materials.map((material) => (
        <Row key={material.id} label={material.material} value={material.type || "—"} />
      ))}
      <View style={styles.cardActions}>
        <Pressable style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
        <Pressable style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Badge({ label, tone = "default" }: { label: string; tone?: "default" | "warning" }) {
  return (
    <View style={[styles.badge, tone === "warning" && styles.badgeWarning]}>
      <Text style={[styles.badgeText, tone === "warning" && styles.badgeTextWarning]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  listContent: { padding: 16, paddingBottom: 100, gap: 12 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
  },
  badgeRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  badge: { backgroundColor: colors.badge, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeWarning: { backgroundColor: "#FEF3C7" },
  badgeText: { fontFamily: fonts.semiBold, fontSize: 11, color: colors.textSecondary },
  badgeTextWarning: { color: "#92400E" },
  itemName: { fontFamily: fonts.bold, fontSize: 18, color: colors.textPrimary, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  rowLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  rowValue: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  cardActions: { flexDirection: "row", gap: 10, marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  deleteButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  deleteButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  editButton: { flex: 1, backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  editButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primaryText },
  fabColumn: { position: "absolute", right: 20, bottom: 20, gap: 12, alignItems: "center" },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
});
