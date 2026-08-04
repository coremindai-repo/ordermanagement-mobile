import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../../theme/colors";
import { fonts } from "../../../theme/typography";
import type { DraftAddress } from "../types";

type Props = {
  value: DraftAddress;
  onChange: (value: DraftAddress) => void;
  showShipmentDate?: boolean;
  disabled?: boolean;
};

export function AddressForm({ value, onChange, showShipmentDate, disabled }: Props) {
  const update = (patch: Partial<DraftAddress>) => onChange({ ...value, ...patch });

  return (
    <View>
      <Field label="Receivers Name">
        <TextInput
          style={styles.input}
          value={value.receiversName}
          onChangeText={(text) => update({ receiversName: text })}
          editable={!disabled}
          placeholder="Full name"
          placeholderTextColor={colors.textPlaceholder}
        />
      </Field>
      <Field label="Receivers Address">
        <TextInput
          style={styles.input}
          value={value.receiversAddress}
          onChangeText={(text) => update({ receiversAddress: text })}
          editable={!disabled}
          placeholder="Street address"
          placeholderTextColor={colors.textPlaceholder}
        />
      </Field>
      <Field label="Country">
        <TextInput
          style={styles.input}
          value={value.country}
          onChangeText={(text) => update({ country: text })}
          editable={!disabled}
          placeholder="India"
          placeholderTextColor={colors.textPlaceholder}
        />
      </Field>
      <Field label="State">
        <TextInput
          style={styles.input}
          value={value.state}
          onChangeText={(text) => update({ state: text })}
          editable={!disabled}
          placeholder="Kerala"
          placeholderTextColor={colors.textPlaceholder}
        />
      </Field>
      <Field label="City/ Town">
        <TextInput
          style={styles.input}
          value={value.cityTown}
          onChangeText={(text) => update({ cityTown: text })}
          editable={!disabled}
          placeholder="Kochi"
          placeholderTextColor={colors.textPlaceholder}
        />
      </Field>
      <Field label="Postal code">
        <TextInput
          style={styles.input}
          value={value.postalCode}
          onChangeText={(text) => update({ postalCode: text })}
          editable={!disabled}
          keyboardType="numeric"
          placeholder="682024"
          placeholderTextColor={colors.textPlaceholder}
        />
      </Field>
      {showShipmentDate ? (
        <Field label="Expected Shipment Date">
          <TextInput
            style={styles.input}
            value={value.expectedShipmentDate ?? ""}
            onChangeText={(text) => update({ expectedShipmentDate: text })}
            editable={!disabled}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={colors.textPlaceholder}
          />
        </Field>
      ) : null}
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export function isAddressComplete(address: DraftAddress): boolean {
  return (
    address.receiversName.trim().length > 0 &&
    address.receiversAddress.trim().length > 0 &&
    address.country.trim().length > 0 &&
    address.state.trim().length > 0 &&
    address.cityTown.trim().length > 0 &&
    address.postalCode.trim().length > 0
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
