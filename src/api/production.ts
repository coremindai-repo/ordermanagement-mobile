import { apiClient } from "./client";
import { uploadPhotoToBlob, type PhotoUploadUrlResponse } from "./photoUpload";
import type { ProductionMethod } from "./orderTypes";

export type ProductionStepTemplateEntry = { code: string; name: string };

/** `steps` contains only genuine work steps — lifecycle statuses (PENDING,
 * WITH_SUPPLIER, SEMI_FINISHED, FINISHED) are deliberately absent. Render as-is. */
export function getProductionStepsTemplate(): Promise<{
  initialStatus: string;
  steps: ProductionStepTemplateEntry[];
}> {
  return apiClient.get("/api/production-steps-template");
}

/** Send step `code`s (case-insensitive match, response echoes template casing). */
export function setProductionPlan(
  lineItemId: string,
  body: { method: ProductionMethod; steps: string[] }
): Promise<unknown> {
  return apiClient.post(`/api/order-line-items/${lineItemId}/production-plan`, body);
}

export type StepUpdateResponse = {
  stepId: string;
  lineItemId: string;
  status: "started" | "complete";
  photos: { blobPath: string; url: string }[];
  allStepsComplete: boolean;
  updatedAt: string;
};

export function updateProductionStep(
  lineItemId: string,
  stepId: string,
  body: { status: "started" | "complete"; assignedNames?: string[]; photoUrls?: string[] }
): Promise<StepUpdateResponse> {
  return apiClient.post(
    `/api/order-line-items/${lineItemId}/production-steps/${stepId}/update`,
    body
  );
}

/** Requires factory_supervisor server-side — step photos are evidence of factory work. */
function requestStepPhotoUploadUrl(
  lineItemId: string,
  stepId: string,
  fileExtension: string
): Promise<PhotoUploadUrlResponse> {
  return apiClient.post(
    `/api/order-line-items/${lineItemId}/production-steps/${stepId}/photo-upload-url`,
    { fileExtension }
  );
}

/** Uploads local photos for a step and returns their blob paths — caller passes these
 * into the next `updateProductionStep` call's `photoUrls` to confirm (step photos have
 * no separate confirm endpoint, unlike reference photos). Tolerates individual failures. */
export async function uploadStepPhotos(
  lineItemId: string,
  stepId: string,
  localUris: string[]
): Promise<{ blobPaths: string[]; failedCount: number }> {
  const blobPaths: string[] = [];
  let failedCount = 0;

  for (const localUri of localUris) {
    try {
      const blobPath = await uploadPhotoToBlob(
        (ext) => requestStepPhotoUploadUrl(lineItemId, stepId, ext),
        localUri
      );
      blobPaths.push(blobPath);
    } catch {
      failedCount += 1;
    }
  }

  return { blobPaths, failedCount };
}
