import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../../theme/colors";
import { fonts } from "../../../theme/typography";

type Props = {
  visible: boolean;
  onCancel: () => void;
  onAdd: (material: string, type: string) => void;
};

export function AddMaterialModal({ visible, onCancel, onAdd }: Props) {
  const [material, setMaterial] = useState("");
  const [type, setType] = useState("");

  const handleAdd = () => {
    if (!material.trim()) return;
    onAdd(material.trim(), type.trim());
    setMaterial("");
    setType("");
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onCancel} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Add material</Text>

          <Text style={styles.label}>Material</Text>
          <TextInput
            style={styles.input}
            placeholder="Eg Glass..."
            placeholderTextColor={colors.textPlaceholder}
            value={material}
            onChangeText={setMaterial}
          />

          <Text style={styles.label}>Type of material</Text>
          <TextInput
            style={styles.input}
            placeholder="E.g., Frosted Glass"
            placeholderTextColor={colors.textPlaceholder}
            value={type}
            onChangeText={setType}
          />

          <Pressable
            style={[styles.addButton, !material.trim() && styles.addButtonDisabled]}
            onPress={handleAdd}
            disabled={!material.trim()}
          >
            <Text style={styles.addButtonText}>Add Material</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(17, 24, 39, 0.5)" },
  backdropTouchable: StyleSheet.absoluteFill,
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  title: { fontFamily: fonts.bold, fontSize: 20, color: colors.textPrimary, marginBottom: 16 },
  label: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  addButtonDisabled: { opacity: 0.5 },
  addButtonText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryText },
});
