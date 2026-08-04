import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { transitionOrder } from "../../api/transitions";
import { ApiError } from "../../api/client";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";

/** Generic single-hop order transition button — used wherever a status only has one
 * legal next move, so a full options panel would be overkill (e.g. dashboard cards). */
export function OrderTransitionButton({
  orderId,
  targetStatus,
  label,
  onDone,
}: {
  orderId: string;
  targetStatus: string;
  label: string;
  onDone: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePress = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await transitionOrder(orderId, targetStatus);
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not update.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Pressable
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handlePress}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color={colors.primaryText} size="small" />
        ) : (
          <Text style={styles.buttonText}>{label}</Text>
        )}
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.primaryText },
  errorText: { fontFamily: fonts.medium, fontSize: 12, color: colors.danger, marginTop: 6 },
});
