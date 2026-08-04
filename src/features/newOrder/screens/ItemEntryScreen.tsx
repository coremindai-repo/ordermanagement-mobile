import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Paperclip, Check } from "lucide-react-native";
import { colors } from "../../../theme/colors";
import { fonts } from "../../../theme/typography";
import { makeLocalId } from "../../../utils/id";
import { useNewOrderDraft } from "../NewOrderDraftContext";
import type { LengthUnit, MaterialEntry } from "../types";
import { AddMaterialModal } from "./AddMaterialModal";
import type { NewOrderScreenProps } from "../navigation";

export function ItemEntryScreen({ navigation, route }: NewOrderScreenProps<"ItemEntry">) {
  const { draft, addManufacturedItem, updateManufacturedItem } = useNewOrderDraft();
  const editItemId = route.params?.editItemId;
  const editingItem = useMemo(
    () =>
      editItemId
        ? draft.items.find((item) => item.id === editItemId && item.kind === "manufactured")
        : undefined,
    [draft.items, editItemId]
  );
  const editing = editingItem?.kind === "manufactured" ? editingItem : undefined;

  const [itemName, setItemName] = useState(editing?.itemName ?? "");
  const [quantity, setQuantity] = useState(editing ? String(editing.quantity) : "1");
  const [length, setLength] = useState(editing?.dimensions.length ?? "");
  const [breadth, setBreadth] = useState(editing?.dimensions.breadth ?? "");
  const [height, setHeight] = useState(editing?.dimensions.height ?? "");
  const [unit, setUnit] = useState<LengthUnit>(editing?.dimensions.unit ?? "cm");
  const [wood, setWood] = useState(
    editing?.materials.find((m) => m.material === "Wood")?.type ?? ""
  );
  const [extraMaterials, setExtraMaterials] = useState<MaterialEntry[]>(
    editing?.materials.filter((m) => m.material !== "Wood") ?? []
  );
  const [finish, setFinish] = useState(editing?.finish ?? "");
  const [photoUris, setPhotoUris] = useState<string[]>(editing?.photoUris ?? []);
  const [priority, setPriority] = useState(editing?.priority ?? false);
  const [materialModalVisible, setMaterialModalVisible] = useState(false);

  const canSubmit =
    itemName.trim().length > 0 &&
    Number(quantity) > 0 &&
    Number(length) > 0 &&
    Number(breadth) > 0 &&
    Number(height) > 0 &&
    wood.trim().length > 0;

  const pickPhoto = () => {
    Alert.alert("Attach Reference", "Add a reference photo", [
      { text: "Take Photo", onPress: () => launchPicker("camera") },
      { text: "Choose from Library", onPress: () => launchPicker("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const launchPicker = async (source: "camera" | "library") => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow access to attach a reference photo.");
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

    if (!result.canceled && result.assets[0]) {
      setPhotoUris((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removePhoto = (uri: string) => {
    setPhotoUris((prev) => prev.filter((existing) => existing !== uri));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const materials: MaterialEntry[] = [
      { id: "wood", material: "Wood", type: wood.trim() },
      ...extraMaterials,
    ];

    const item = {
      itemName: itemName.trim(),
      quantity: Math.max(1, Math.round(Number(quantity))),
      dimensions: { length, breadth, height, unit },
      materials,
      finish,
      photoUris,
      priority,
    };

    if (editing) {
      updateManufacturedItem(editing.id, item);
    } else {
      addManufacturedItem(item);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Field label="Item name">
          <TextInput
            style={styles.input}
            placeholder="e.g. Flat Diwan"
            placeholderTextColor={colors.textPlaceholder}
            value={itemName}
            onChangeText={setItemName}
          />
        </Field>

        <Field label="Item Quantity*">
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor={colors.textPlaceholder}
            keyboardType="numeric"
            value={quantity}
            onChangeText={setQuantity}
          />
        </Field>

        <View style={styles.sizeHeaderRow}>
          <Text style={styles.label}>Item Size*</Text>
          <View style={styles.unitToggle}>
            <Pressable
              style={[styles.unitOption, unit === "cm" && styles.unitOptionActive]}
              onPress={() => setUnit("cm")}
            >
              <Text style={[styles.unitText, unit === "cm" && styles.unitTextActive]}>cm</Text>
            </Pressable>
            <Pressable
              style={[styles.unitOption, unit === "m" && styles.unitOptionActive]}
              onPress={() => setUnit("m")}
            >
              <Text style={[styles.unitText, unit === "m" && styles.unitTextActive]}>m</Text>
            </Pressable>
          </View>
        </View>
        <View style={styles.dimensionsRow}>
          <DimensionInput label="L:" value={length} onChangeText={setLength} />
          <DimensionInput label="B:" value={breadth} onChangeText={setBreadth} />
          <DimensionInput label="H:" value={height} onChangeText={setHeight} />
        </View>

        <Field label="Wood*">
          <TextInput
            style={styles.input}
            placeholder="e.g. Teak"
            placeholderTextColor={colors.textPlaceholder}
            value={wood}
            onChangeText={setWood}
          />
        </Field>

        <Field label="Finish">
          <TextInput
            style={styles.input}
            placeholder="e.g. Matte"
            placeholderTextColor={colors.textPlaceholder}
            value={finish}
            onChangeText={setFinish}
          />
        </Field>

        {extraMaterials.map((entry) => (
          <View key={entry.id} style={styles.materialRow}>
            <Text style={styles.materialLabel}>{entry.material}</Text>
            <Text style={styles.materialValue}>{entry.type}</Text>
            <Pressable
              onPress={() =>
                setExtraMaterials((prev) => prev.filter((existing) => existing.id !== entry.id))
              }
            >
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        ))}

        <Pressable style={styles.addMaterialLink} onPress={() => setMaterialModalVisible(true)}>
          <Text style={styles.addMaterialText}>+ Add material</Text>
        </Pressable>

        <Text style={styles.label}>Attach References</Text>
        <Text style={styles.helperText}>
          Helps the factory team see what to build — especially for custom orders.
        </Text>
        <View style={styles.photoRow}>
          {photoUris.map((uri) => (
            <Pressable key={uri} onPress={() => removePhoto(uri)}>
              <Image source={{ uri }} style={styles.photoThumb} />
            </Pressable>
          ))}
          <Pressable style={styles.photoAddTile} onPress={pickPhoto}>
            <Paperclip size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <Pressable style={styles.priorityRow} onPress={() => setPriority((prev) => !prev)}>
          <View style={[styles.checkbox, priority && styles.checkboxChecked]}>
            {priority ? <Check size={14} color="#FFFFFF" /> : null}
          </View>
          <Text style={styles.priorityLabel}>Priority Order</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text style={styles.submitText}>{editing ? "Save Item" : "Add Item"}</Text>
        </Pressable>
      </View>

      <AddMaterialModal
        visible={materialModalVisible}
        onCancel={() => setMaterialModalVisible(false)}
        onAdd={(material, type) => {
          setExtraMaterials((prev) => [...prev, { id: makeLocalId(), material, type }]);
          setMaterialModalVisible(false);
        }}
      />
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

function DimensionInput({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View style={styles.dimensionField}>
      <Text style={styles.dimensionLabel}>{label}</Text>
      <TextInput
        style={styles.dimensionInput}
        placeholder="0"
        placeholderTextColor={colors.textPlaceholder}
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 32 },
  field: { marginBottom: 20 },
  label: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textPrimary, marginBottom: 8 },
  helperText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
  sizeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  unitToggle: {
    flexDirection: "row",
    backgroundColor: colors.badge,
    borderRadius: 20,
    padding: 2,
  },
  unitOption: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 18 },
  unitOptionActive: { backgroundColor: colors.primary },
  unitText: { fontFamily: fonts.semiBold, fontSize: 12, color: colors.textSecondary },
  unitTextActive: { color: colors.primaryText },
  dimensionsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  dimensionField: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  dimensionLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
  dimensionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  materialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  materialLabel: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.textPrimary },
  materialValue: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary, flex: 1, marginLeft: 12 },
  removeText: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger },
  addMaterialLink: { marginBottom: 24, marginTop: 4 },
  addMaterialText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary, textDecorationLine: "underline" },
  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  photoThumb: { width: 64, height: 64, borderRadius: 10 },
  photoAddTile: {
    width: 64,
    height: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  priorityRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
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
  priorityLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryText },
});
