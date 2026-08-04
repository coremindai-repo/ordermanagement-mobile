import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { colors } from "../../../theme/colors";
import { fonts } from "../../../theme/typography";
import { useNewOrderDraft } from "../NewOrderDraftContext";
import { emptyAddress } from "../types";
import { AddressForm, isAddressComplete } from "./AddressForm";

export function BillingDeliveryPanel() {
  const { draft, setBillTo, setShipTo, setSameAsBilling } = useNewOrderDraft();
  const [activeSubTab, setActiveSubTab] = useState<"billTo" | "shipTo">("billTo");

  const billTo = draft.billTo ?? emptyAddress;
  const shipTo = draft.shipTo ?? emptyAddress;
  const billComplete = isAddressComplete(billTo);
  const shipComplete = isAddressComplete(shipTo);

  return (
    <View style={styles.flex}>
      <View style={styles.subTabRow}>
        <SubTab
          label="BILL TO"
          active={activeSubTab === "billTo"}
          complete={billComplete}
          onPress={() => setActiveSubTab("billTo")}
        />
        <SubTab
          label="SHIP TO"
          active={activeSubTab === "shipTo"}
          complete={shipComplete}
          onPress={() => setActiveSubTab("shipTo")}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {activeSubTab === "shipTo" ? (
          <Pressable
            style={styles.sameAsRow}
            onPress={() => setSameAsBilling(!draft.sameAsBilling)}
          >
            <View style={[styles.checkbox, draft.sameAsBilling && styles.checkboxChecked]}>
              {draft.sameAsBilling ? <Check size={14} color="#FFFFFF" /> : null}
            </View>
            <Text style={styles.sameAsLabel}>Same as billing address?</Text>
          </Pressable>
        ) : null}

        {activeSubTab === "billTo" ? (
          <AddressForm value={billTo} onChange={setBillTo} />
        ) : (
          <AddressForm
            value={shipTo}
            onChange={setShipTo}
            showShipmentDate
            disabled={draft.sameAsBilling}
          />
        )}
      </ScrollView>
    </View>
  );
}

function SubTab({
  label,
  active,
  complete,
  onPress,
}: {
  label: string;
  active: boolean;
  complete: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.subTab, active && styles.subTabActive]} onPress={onPress}>
      <Text style={[styles.subTabText, active && styles.subTabTextActive]}>{label}</Text>
      {complete ? (
        <View style={styles.checkCircle}>
          <Check size={10} color="#FFFFFF" />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  subTabRow: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: colors.badge,
    borderRadius: 20,
    padding: 4,
    marginVertical: 16,
  },
  subTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  subTabActive: { backgroundColor: colors.surface },
  subTabText: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textSecondary },
  subTabTextActive: { color: colors.textPrimary },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },
  sameAsRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
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
  sameAsLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
});
