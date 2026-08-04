import React, { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getStores } from "../../api/stores";
import { updateOutsourcingRequestStatus } from "../../api/outsourcing";
import { setDestinationStore } from "../../api/transitions";
import { ApiError } from "../../api/client";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import type { OutsourcingRequest, OutsourcingRequestStatus } from "../../api/outsourcingTypes";

type FinishChoice = "received_finished" | "received_semi_finished";

/**
 * Import always receives finished (contract §6: received_semi_finished is
 * outsource-only) — no branch to ask about. Outsource genuinely branches, so that
 * choice is asked here (not shown in the Import-only mockup, but a real distinction
 * the contract draws). Destination (Store vs Factory) is a separate, order-level
 * convenience layered on top — confirmed: "Kochi Store" calls destination-store
 * immediately, "Factory" is a no-op (implicit default, no precondition on that
 * endpoint). Store options come from GET /api/stores, not hardcoded, since a third
 * store is a data change, not a deploy (contract §8).
 */
export function ReceiveOutsourcingModal({
  visible,
  requests,
  onDone,
  onCancel,
}: {
  visible: boolean;
  requests: OutsourcingRequest[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [finishChoice, setFinishChoice] = useState<FinishChoice | null>(null);
  const [destinationStoreId, setDestinationStoreId] = useState<string | "factory" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allImport = requests.every((r) => r.method === "import");
  const needsFinishChoice = !allImport;
  const effectiveFinishChoice: FinishChoice | null = allImport ? "received_finished" : finishChoice;
  const showDestinationChoice = effectiveFinishChoice === "received_finished";

  const storesQuery = useQuery({
    queryKey: ["stores"],
    queryFn: getStores,
    enabled: visible && showDestinationChoice,
  });

  const canSubmit =
    effectiveFinishChoice !== null && (!showDestinationChoice || destinationStoreId !== null);

  const handleSubmit = async () => {
    if (!canSubmit || !effectiveFinishChoice) return;
    setSubmitting(true);
    setError(null);
    try {
      const orderIdsToRoute = new Set<string>();

      for (const request of requests) {
        const targetStatus: OutsourcingRequestStatus =
          request.method === "import" ? "received_finished" : effectiveFinishChoice;
        await updateOutsourcingRequestStatus(request.requestId, { status: targetStatus });
        if (targetStatus === "received_finished" && destinationStoreId && destinationStoreId !== "factory") {
          (request.lineItems ?? []).forEach((li) => orderIdsToRoute.add(li.orderId));
        }
      }

      if (destinationStoreId && destinationStoreId !== "factory") {
        for (const orderId of orderIdsToRoute) {
          await setDestinationStore(orderId, destinationStoreId);
        }
      }

      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropTouchable} onPress={onCancel} />
        <View style={styles.sheet}>
          <Text style={styles.title}>Item Arrived</Text>

          {needsFinishChoice ? (
            <>
              <Text style={styles.label}>Received as</Text>
              <View style={styles.optionRow}>
                <RadioOption
                  label="Finished"
                  selected={finishChoice === "received_finished"}
                  onPress={() => setFinishChoice("received_finished")}
                />
                <RadioOption
                  label="Semi-finished"
                  selected={finishChoice === "received_semi_finished"}
                  onPress={() => setFinishChoice("received_semi_finished")}
                />
              </View>
            </>
          ) : null}

          {showDestinationChoice ? (
            <>
              <Text style={styles.label}>Item Arrived in</Text>
              {storesQuery.isLoading ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <ScrollView style={{ maxHeight: 180 }}>
                  {(storesQuery.data?.stores ?? []).map((store) => (
                    <RadioOption
                      key={store.storeId}
                      label={store.name}
                      selected={destinationStoreId === store.storeId}
                      onPress={() => setDestinationStoreId(store.storeId)}
                    />
                  ))}
                  <RadioOption
                    label="Factory"
                    selected={destinationStoreId === "factory"}
                    onPress={() => setDestinationStoreId("factory")}
                  />
                </ScrollView>
              )}
            </>
          ) : null}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={[styles.submitButton, (!canSubmit || submitting) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.primaryText} />
            ) : (
              <Text style={styles.submitText}>Submit</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function RadioOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.optionButton} onPress={onPress}>
      <View style={[styles.radio, selected && styles.radioSelected]} />
      <Text style={styles.optionLabel}>{label}</Text>
    </Pressable>
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
  label: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary, marginBottom: 10 },
  optionRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  radioSelected: { borderColor: colors.primary, borderWidth: 5 },
  optionLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary },
  errorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger, marginBottom: 12 },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryText },
});
