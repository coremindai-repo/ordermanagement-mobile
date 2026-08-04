import React, { useState } from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { createRawMaterialRequest } from "../../api/rawMaterials";
import { ApiError } from "../../api/client";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";

export function CreateRawMaterialRequestModal({
  visible,
  lineItemId,
  onCreated,
  onCancel,
}: {
  visible: boolean;
  /** Omit for a standalone (stock-level) request. */
  lineItemId?: string;
  onCreated: () => void;
  onCancel: () => void;
}) {
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = description.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await createRawMaterialRequest({
        items: [{ description: description.trim() }],
        notes: notes.trim() || null,
        lineItemId: lineItemId ?? null,
      });
      setDescription("");
      setNotes("");
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create request. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onCancel} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Request Raw Materials</Text>

          <Text style={styles.label}>What&rsquo;s needed</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2m Teak plank, Frosted glass panel"
            placeholderTextColor={colors.textPlaceholder}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.input}
            placeholder="Optional"
            placeholderTextColor={colors.textPlaceholder}
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.submitButton, (!canSubmit || submitting) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.submitText}>Send Request</Text>
            )}
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
    minHeight: 48,
  },
  errorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger, marginBottom: 12 },
  submitButton: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  submitButtonDisabled: { opacity: 0.5 },
  submitText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryText },
});
