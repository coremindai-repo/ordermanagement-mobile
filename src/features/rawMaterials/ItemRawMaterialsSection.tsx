import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getRawMaterialRequests } from "../../api/rawMaterials";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import { RawMaterialRequestRow } from "./RawMaterialRequestRow";
import { CreateRawMaterialRequestModal } from "./CreateRawMaterialRequestModal";

export function ItemRawMaterialsSection({
  lineItemId,
  canRequest,
}: {
  lineItemId: string;
  canRequest: boolean;
}) {
  const [createVisible, setCreateVisible] = useState(false);
  const query = useQuery({
    queryKey: ["raw-material-requests", "lineItem", lineItemId],
    queryFn: () => getRawMaterialRequests({ lineItemId }),
  });

  const requests = query.data?.requests ?? [];

  if (!canRequest && requests.length === 0) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Raw Materials</Text>

      {query.isLoading ? <ActivityIndicator color={colors.primary} /> : null}

      {requests.map((request) => (
        <RawMaterialRequestRow key={request.requestId} request={request} showItemTag={false} />
      ))}

      {!query.isLoading && requests.length === 0 ? (
        <Text style={styles.emptyText}>No raw material requests for this item yet.</Text>
      ) : null}

      {canRequest ? (
        <Pressable style={styles.requestButton} onPress={() => setCreateVisible(true)}>
          <Text style={styles.requestButtonText}>Request Raw Materials</Text>
        </Pressable>
      ) : null}

      <CreateRawMaterialRequestModal
        visible={createVisible}
        lineItemId={lineItemId}
        onCreated={() => {
          setCreateVisible(false);
          query.refetch();
        }}
        onCancel={() => setCreateVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary, marginBottom: 8 },
  emptyText: { fontFamily: fonts.regular, fontSize: 13, color: colors.textSecondary, marginBottom: 12 },
  requestButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  requestButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
});
