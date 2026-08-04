import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";

/** Stand-in for screens that land in a later epic — keeps the nav shell honest about what's built. */
export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>This screen is built in a later epic.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  title: { fontFamily: fonts.bold, fontSize: 18, color: colors.textPrimary, marginBottom: 8 },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
});
