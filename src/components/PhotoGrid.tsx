import React, { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { X } from "lucide-react-native";
import { colors } from "../theme/colors";
import type { PhotoRef } from "../api/photoUpload";

/**
 * Shared display for both reference photos and step photos — both are just
 * `{blobPath, url}[]` with short-lived (~15 min) SAS read URLs. Thumbnails here, tap
 * opens a full-screen viewer. URLs aren't cached beyond the current fetch — re-fetching
 * the order/step (pull-to-refresh) is what refreshes them, per the app's refresh model.
 */
export function PhotoGrid({ photos, thumbSize = 64 }: { photos: PhotoRef[]; thumbSize?: number }) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      <View style={styles.row}>
        {photos.map((photo, index) => (
          <Pressable key={photo.blobPath} onPress={() => setViewerIndex(index)}>
            <Image
              source={{ uri: photo.url }}
              style={[styles.thumb, { width: thumbSize, height: thumbSize }]}
            />
          </Pressable>
        ))}
      </View>

      <PhotoViewerModal
        photos={photos}
        index={viewerIndex}
        onClose={() => setViewerIndex(null)}
      />
    </>
  );
}

function PhotoViewerModal({
  photos,
  index,
  onClose,
}: {
  photos: PhotoRef[];
  index: number | null;
  onClose: () => void;
}) {
  const { width, height } = useWindowDimensions();

  if (index === null) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#FFFFFF" />
        </Pressable>
        <Image
          source={{ uri: photos[index].url }}
          style={{ width, height: height * 0.8 }}
          resizeMode="contain"
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  thumb: { borderRadius: 10, backgroundColor: colors.badge },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: { position: "absolute", top: 56, right: 24, zIndex: 1 },
});
