import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react-native";
import { getProductionStepsTemplate, setProductionPlan } from "../../api/production";
import { ApiError } from "../../api/client";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import type { ProductionMethod } from "../../api/orderTypes";

const METHODS: { key: ProductionMethod; label: string }[] = [
  { key: "factory", label: "Factory" },
  { key: "outsource", label: "Outsource" },
  { key: "import", label: "Import" },
];

/**
 * Only sets the production plan (method + factory step checklist) — POST
 * .../production-plan, which needs no stepId. For outsource/import this just records
 * the method; actually placing/tracking the outsourcing request is company_manager-only
 * (contract §3) and happens in the separate Outsourcing/Import flow (Epic 6).
 *
 * With `fixedMethod` set, this is the semi-finished re-entry case instead: an
 * outsourced item came back needing factory work, method is already fixed, and only
 * the step checklist is shown (contract §6: "semi-finished items re-enter the same
 * step checklist factory items use").
 */
export function MethodChoicePanel({
  lineItemId,
  onPlanSaved,
  fixedMethod,
}: {
  lineItemId: string;
  onPlanSaved: () => void;
  fixedMethod?: ProductionMethod;
}) {
  const [method, setMethod] = useState<ProductionMethod | null>(fixedMethod ?? null);
  const [selectedSteps, setSelectedSteps] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const showStepChecklist = fixedMethod ? true : method === "factory";

  const templateQuery = useQuery({
    queryKey: ["production-steps-template"],
    queryFn: getProductionStepsTemplate,
    enabled: showStepChecklist,
  });

  const toggleStep = (step: string) => {
    setSelectedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(step)) next.delete(step);
      else next.add(step);
      return next;
    });
  };

  const canSubmit = showStepChecklist ? selectedSteps.size > 0 : method !== null;

  const submitLabel = fixedMethod
    ? "Save and Continue"
    : method === "outsource"
      ? "Initiate Outsourcing"
      : method === "import"
        ? "Initiate Import"
        : "Save and Continue";

  const handleSubmit = async () => {
    if (!method || !canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const steps = showStepChecklist ? Array.from(selectedSteps) : [];
      await setProductionPlan(lineItemId, { method, steps });
      onPlanSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        {fixedMethod ? "Plan remaining steps" : "Method Of Production"}
      </Text>

      {fixedMethod ? null : (
        <View style={styles.methodRow}>
          {METHODS.map((option) => (
            <Pressable
              key={option.key}
              style={[styles.methodOption, method === option.key && styles.methodOptionSelected]}
              onPress={() => setMethod(option.key)}
            >
              <Text
                style={[
                  styles.methodLabel,
                  method === option.key && styles.methodLabelSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {showStepChecklist ? (
        <View style={styles.stepsBox}>
          <Text style={styles.stepsTitle}>This item will require</Text>
          {templateQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            (templateQuery.data?.steps ?? []).map((step) => {
              const checked = selectedSteps.has(step.code);
              return (
                <Pressable
                  key={step.code}
                  style={styles.stepRow}
                  onPress={() => toggleStep(step.code)}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked ? <Check size={14} color="#FFFFFF" /> : null}
                  </View>
                  <Text style={styles.stepLabel}>{step.name}</Text>
                </Pressable>
              );
            })
          )}
        </View>
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
          <Text style={styles.submitText}>{submitLabel}</Text>
        )}
      </Pressable>
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
  sectionTitle: { fontFamily: fonts.bold, fontSize: 15, color: colors.textPrimary, marginBottom: 12 },
  methodRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  methodOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  methodOptionSelected: { borderColor: colors.primary, backgroundColor: colors.backgroundMuted },
  methodLabel: { fontFamily: fonts.medium, fontSize: 14, color: colors.textSecondary },
  methodLabelSelected: { color: colors.textPrimary, fontFamily: fonts.semiBold },
  stepsBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  stepsTitle: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.textSecondary, marginBottom: 10 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
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
  stepLabel: { fontFamily: fonts.medium, fontSize: 15, color: colors.textPrimary },
  errorText: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger, marginBottom: 12 },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitText: { fontFamily: fonts.bold, fontSize: 15, color: colors.primaryText },
});
