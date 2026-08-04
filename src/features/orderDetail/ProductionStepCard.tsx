import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Paperclip, Check, X } from "lucide-react-native";
import { updateProductionStep, uploadStepPhotos } from "../../api/production";
import { ApiError } from "../../api/client";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import { PhotoGrid } from "../../components/PhotoGrid";
import type { ProductionStep } from "../../api/orderTypes";

/**
 * The active step's interactive card. Checkboxes fire the step-update call
 * immediately (status is required on every call and re-sending the current status is
 * a 409, so there's no separate "Save" step — assignedNames/photos are only actually
 * sent at a status transition). Photo capture is disabled once complete: there's no
 * further transition to attach new photos to.
 */
export function ProductionStepCard({
  lineItemId,
  step,
  onUpdated,
}: {
  lineItemId: string;
  step: ProductionStep;
  onUpdated: () => void;
}) {
  const [nameInput, setNameInput] = useState("");
  const [assignedNames, setAssignedNames] = useState<string[]>(step.assignedNames);
  const [localPhotoUris, setLocalPhotoUris] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<"started" | "complete" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const workStarted = step.status !== "pending";
  const complete = step.status === "complete";

  const addName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setAssignedNames((prev) => [...prev, trimmed]);
    setNameInput("");
  };

  const removeName = (name: string) => {
    setAssignedNames((prev) => prev.filter((existing) => existing !== name));
  };

  const pickPhoto = () => {
    Alert.alert("Add Photo", "Attach a work photo", [
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
      Alert.alert("Permission needed", "Allow access to attach a photo.");
      return;
    }
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setLocalPhotoUris((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeLocalPhoto = (uri: string) => {
    setLocalPhotoUris((prev) => prev.filter((existing) => existing !== uri));
  };

  const submitStatus = async (status: "started" | "complete") => {
    setSubmitting(status);
    setError(null);
    try {
      let photoUrls: string[] | undefined;
      if (localPhotoUris.length > 0) {
        const { blobPaths, failedCount } = await uploadStepPhotos(
          lineItemId,
          step.stepId,
          localPhotoUris
        );
        if (failedCount > 0) {
          setError(`${failedCount} photo(s) failed to upload — status was not updated. Try again.`);
          setSubmitting(null);
          return;
        }
        photoUrls = blobPaths;
      }
      await updateProductionStep(lineItemId, step.stepId, { status, assignedNames, photoUrls });
      setLocalPhotoUris([]);
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update. Try again.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{step.stepName}</Text>

      <Text style={styles.label}>Assign {step.stepName}</Text>
      {assignedNames.length > 0 ? (
        <View style={styles.nameChipsRow}>
          {assignedNames.map((name) => (
            <View key={name} style={styles.chip}>
              <Text style={styles.chipText}>{name}</Text>
              {!complete ? (
                <Pressable onPress={() => removeName(name)}>
                  <X size={12} color={colors.textSecondary} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
      {!complete ? (
        <View style={styles.addNameRow}>
          <TextInput
            style={styles.nameInput}
            placeholder="Add a name"
            placeholderTextColor={colors.textPlaceholder}
            value={nameInput}
            onChangeText={setNameInput}
            onSubmitEditing={addName}
            returnKeyType="done"
          />
          <Pressable style={styles.addNameButton} onPress={addName}>
            <Text style={styles.addNameButtonText}>Add</Text>
          </Pressable>
        </View>
      ) : null}

      <Pressable
        style={styles.checkRow}
        onPress={() => submitStatus("started")}
        disabled={workStarted || submitting !== null}
      >
        <View style={[styles.checkbox, workStarted && styles.checkboxChecked]}>
          {workStarted ? <Check size={14} color="#FFFFFF" /> : null}
        </View>
        <Text style={styles.checkLabel}>Work started</Text>
        {submitting === "started" ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : step.startedAt ? (
          <Text style={styles.timestamp}>{formatTimestamp(step.startedAt)}</Text>
        ) : null}
      </Pressable>

      <Pressable
        style={styles.checkRow}
        onPress={() => submitStatus("complete")}
        disabled={!workStarted || complete || submitting !== null}
      >
        <View
          style={[
            styles.checkbox,
            complete && styles.checkboxChecked,
            !workStarted && styles.checkboxDisabled,
          ]}
        >
          {complete ? <Check size={14} color="#FFFFFF" /> : null}
        </View>
        <Text style={[styles.checkLabel, !workStarted && styles.checkLabelDisabled]}>
          Complete
        </Text>
        {submitting === "complete" ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : step.completedAt ? (
          <Text style={styles.timestamp}>{formatTimestamp(step.completedAt)}</Text>
        ) : null}
      </Pressable>

      <Text style={styles.label}>Photos</Text>
      <PhotoGrid photos={step.photos} thumbSize={56} />
      {(localPhotoUris.length > 0 || !complete) && (
        <View style={styles.photoRow}>
          {localPhotoUris.map((uri) => (
            <Pressable key={uri} onPress={() => removeLocalPhoto(uri)}>
              <Image source={{ uri }} style={styles.localPhotoThumb} />
            </Pressable>
          ))}
          {!complete ? (
            <Pressable style={styles.photoAddTile} onPress={pickPhoto}>
              <Paperclip size={18} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 16, color: colors.textPrimary, marginBottom: 12 },
  label: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textSecondary, marginTop: 8, marginBottom: 8 },
  nameChipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.badge,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontFamily: fonts.medium, fontSize: 13, color: colors.textPrimary },
  addNameRow: { flexDirection: "row", gap: 8 },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  addNameButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  addNameButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
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
  checkboxDisabled: { opacity: 0.5 },
  checkLabel: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
  checkLabelDisabled: { color: colors.textPlaceholder },
  timestamp: { fontFamily: fonts.regular, fontSize: 11, color: colors.textSecondary },
  photoRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  localPhotoThumb: { width: 56, height: 56, borderRadius: 10, opacity: 0.6 },
  photoAddTile: {
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger, marginTop: 8 },
});
