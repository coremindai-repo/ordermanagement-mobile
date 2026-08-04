import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../../theme/colors";
import { fonts } from "../../../theme/typography";
import { useNewOrderDraft } from "../NewOrderDraftContext";
import { createDraft } from "../types";
import type { NewOrderScreenProps } from "../navigation";

export function OrderTypePickerScreen({ navigation }: NewOrderScreenProps<"OrderTypePicker">) {
  const { reset } = useNewOrderDraft();

  const choose = (orderType: "stock" | "customer") => {
    reset(createDraft(orderType));
    navigation.replace("CreateOrder");
  };

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropTouchable} onPress={() => navigation.goBack()} />
      <View style={styles.sheet}>
        <Text style={styles.title}>Create a</Text>
        <View style={styles.row}>
          <Pressable style={styles.optionButton} onPress={() => choose("stock")}>
            <Text style={styles.optionText}>STOCK ORDER</Text>
          </Pressable>
          <Pressable style={styles.optionButton} onPress={() => choose("customer")}>
            <Text style={styles.optionText}>CUSTOMER ORDER</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(17, 24, 39, 0.5)",
  },
  backdropTouchable: StyleSheet.absoluteFill,
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.textPrimary, marginBottom: 16 },
  row: { flexDirection: "row", gap: 12 },
  optionButton: {
    flex: 1,
    backgroundColor: colors.backgroundMuted,
    borderRadius: 12,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textPrimary },
});
