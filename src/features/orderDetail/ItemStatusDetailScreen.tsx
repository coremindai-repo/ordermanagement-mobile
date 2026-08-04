import React, { useLayoutEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getOrder } from "../../api/orders";
import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import { formatStatus } from "../../utils/formatStatus";
import { formatDimensions } from "../../utils/formatDimensions";
import { PhotoGrid } from "../../components/PhotoGrid";
import { MethodChoicePanel } from "./MethodChoicePanel";
import { ProductionStepCard } from "./ProductionStepCard";
import { CompletedStepSummary } from "./CompletedStepSummary";
import { ChooseNextStepModal } from "./ChooseNextStepModal";
import { ProductionCompleteModal } from "./ProductionCompleteModal";
import { OrderStatusActionPanel } from "./OrderStatusActionPanel";
import { ItemRawMaterialsSection } from "../rawMaterials/ItemRawMaterialsSection";
import { supervisorLegalNextStatuses, managerLegalNextStatuses } from "../../utils/orderStatusGraph";
import type { OrdersScreenProps } from "../orders/navigation";

export function ItemStatusDetailScreen({
  navigation,
  route,
}: OrdersScreenProps<"ItemStatusDetail">) {
  const { orderId, lineItemId } = route.params;
  const { user } = useAuth();
  const query = useQuery({ queryKey: ["order", orderId], queryFn: () => getOrder(orderId) });
  const [chooseStepVisible, setChooseStepVisible] = useState(false);
  const [completeVisible, setCompleteVisible] = useState(false);

  const item = query.data?.lineItems.find((li) => li.lineItemId === lineItemId);
  const canChooseMethod = !!user?.roles.includes("factory_supervisor");
  const canManageLogistics = !!user?.roles.some(
    (role) => role === "store_manager" || role === "company_manager"
  );

  useLayoutEffect(() => {
    navigation.setOptions({ title: item?.itemName ?? "Item" });
  }, [navigation, item?.itemName]);

  if (query.isLoading) {
    return <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />;
  }

  if (query.isError || !item || !query.data) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.errorText}>
          {query.error instanceof ApiError ? query.error.message : "Could not load this item."}
        </Text>
        <Pressable style={styles.retryButton} onPress={() => query.refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const refetch = () => query.refetch();

  const completedSteps = item.productionSteps.filter((s) => s.status === "complete");
  const activeStep = item.productionSteps.find(
    (s) => s.stepName === item.currentStatus && s.status !== "complete"
  );
  const pendingSteps = item.productionSteps.filter((s) => s.status === "pending");
  const allStepsPlanned = item.productionSteps.length > 0;
  const allStepsComplete = allStepsPlanned && item.productionSteps.every((s) => s.status === "complete");
  const needsNextStepChoice = allStepsPlanned && !activeStep && !allStepsComplete && pendingSteps.length > 0;
  const needsCompletionConfirm = allStepsComplete && item.currentStatus !== "FINISHED";

  const showStepTimeline = canChooseMethod && item.method !== null && allStepsPlanned;
  const needsOutsourceReentry =
    canChooseMethod &&
    item.method === "outsource" &&
    item.currentStatus === "SEMI_FINISHED" &&
    !allStepsPlanned;

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Item Description</Text>
        {item.dimensions ? (
          <InfoRow label="Dimensions" value={formatDimensions(item.dimensions)} />
        ) : null}
        {item.finish ? <InfoRow label="Finish" value={item.finish} /> : null}
        {item.materials.map((material, index) => {
          const materialRecord = material as Record<string, unknown>;
          const label = typeof materialRecord.material === "string" ? materialRecord.material : "Material";
          const value = typeof materialRecord.type === "string" ? materialRecord.type : "";
          return <InfoRow key={`${label}-${index}`} label={label} value={value} />;
        })}
        {item.description ? <InfoRow label="Notes" value={item.description} /> : null}
        {item.referencePhotos.length > 0 ? (
          <View style={styles.photosBlock}>
            <Text style={styles.photosLabel}>References</Text>
            <PhotoGrid photos={item.referencePhotos} />
          </View>
        ) : null}
      </View>

      {item.method === null && canChooseMethod ? (
        <MethodChoicePanel lineItemId={item.lineItemId} onPlanSaved={refetch} />
      ) : needsOutsourceReentry ? (
        <MethodChoicePanel
          lineItemId={item.lineItemId}
          onPlanSaved={refetch}
          fixedMethod="outsource"
        />
      ) : showStepTimeline ? (
        <>
          {completedSteps.map((step) => (
            <CompletedStepSummary key={step.stepId} step={step} />
          ))}

          {activeStep ? (
            <ProductionStepCard lineItemId={item.lineItemId} step={activeStep} onUpdated={refetch} />
          ) : null}

          {needsNextStepChoice ? (
            <Pressable style={styles.promptButton} onPress={() => setChooseStepVisible(true)}>
              <Text style={styles.promptButtonText}>Choose next step</Text>
            </Pressable>
          ) : null}

          {needsCompletionConfirm ? (
            <Pressable style={styles.promptButton} onPress={() => setCompleteVisible(true)}>
              <Text style={styles.promptButtonText}>Mark production complete</Text>
            </Pressable>
          ) : null}
        </>
      ) : (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status</Text>
          <InfoRow label="Current status" value={formatStatus(item.currentStatus)} />
          {item.currentStep ? (
            <InfoRow label="Current step" value={formatStatus(item.currentStep)} />
          ) : null}
          {item.method ? <InfoRow label="Method" value={formatStatus(item.method)} /> : null}
          {item.availabilityStatus ? (
            <InfoRow label="Availability" value={formatStatus(item.availabilityStatus)} />
          ) : null}
          {item.originatingOrderNumber ? (
            <InfoRow label="Made by order" value={item.originatingOrderNumber} />
          ) : null}
        </View>
      )}

      {canChooseMethod && item.currentStatus === "FINISHED" ? (
        <OrderStatusActionPanel
          order={query.data}
          legalStates={supervisorLegalNextStatuses(
            query.data.currentStatus,
            query.data.orderType,
            !!query.data.store
          )}
          onDone={refetch}
        />
      ) : null}

      {canManageLogistics ? (
        <OrderStatusActionPanel
          order={query.data}
          legalStates={managerLegalNextStatuses(query.data.currentStatus)}
          title="Item Logistics"
          onDone={refetch}
        />
      ) : null}

      <ItemRawMaterialsSection lineItemId={item.lineItemId} canRequest={canChooseMethod} />

      <ChooseNextStepModal
        visible={chooseStepVisible}
        lineItemId={item.lineItemId}
        options={pendingSteps}
        onDone={() => {
          setChooseStepVisible(false);
          refetch();
        }}
        onCancel={() => setChooseStepVisible(false)}
      />
      <ProductionCompleteModal
        visible={completeVisible}
        lineItemId={item.lineItemId}
        onDone={() => {
          setCompleteVisible(false);
          refetch();
        }}
        onCancel={() => setCompleteVisible(false)}
      />
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  errorText: { fontFamily: fonts.medium, fontSize: 14, color: colors.danger, textAlign: "center" },
  retryButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  retryButtonText: { fontFamily: fonts.semiBold, fontSize: 14, color: colors.textPrimary },
  scrollContent: { padding: 16, gap: 16, backgroundColor: colors.backgroundMuted },
  photosBlock: { marginTop: 12 },
  photosLabel: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
  },
  sectionTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary, marginBottom: 8 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.textSecondary },
  infoValue: { fontFamily: fonts.medium, fontSize: 14, color: colors.textPrimary, flexShrink: 1, textAlign: "right", marginLeft: 12 },
  promptButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  promptButtonText: { fontFamily: fonts.bold, fontSize: 15, color: colors.primaryText },
});
