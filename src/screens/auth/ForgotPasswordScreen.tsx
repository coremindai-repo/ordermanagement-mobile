import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { HelpCircle } from "lucide-react-native";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import type { AuthStackScreenProps } from "../../navigation/types";

const STEPS = [
  "Contact your showroom manager, or the system administrator at head office.",
  "Give them the username on your account.",
  "They will issue a temporary password for your next sign in.",
];

export function ForgotPasswordScreen({ navigation }: AuthStackScreenProps<"ForgotPassword">) {
  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <HelpCircle size={28} color={colors.textPrimary} strokeWidth={2} />
          <Text style={styles.cardTitle}>Passwords are reset for you</Text>
          <Text style={styles.cardBody}>
            Accounts on this app are issued and managed centrally. There is no reset link.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.listHeading}>What to do</Text>
          {STEPS.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back to Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.backgroundMuted },
  scrollContent: { padding: 16, gap: 16 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  cardTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.textPrimary,
    marginTop: 12,
    marginBottom: 8,
  },
  cardBody: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  listHeading: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  stepRow: { flexDirection: "row", marginBottom: 16 },
  stepNumber: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPlaceholder,
    width: 24,
  },
  stepText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  footer: {
    padding: 16,
    backgroundColor: colors.backgroundMuted,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
  },
  backButtonText: { fontFamily: fonts.bold, fontSize: 16, color: colors.primaryText },
});
