import { apiClient } from "./client";
import { uploadPhotoToBlob, type PhotoRef, type PhotoUploadUrlResponse } from "./photoUpload";

/**
 * Reference photos are captured by the salesperson at item entry (before any production
 * step exists) and read by the factory supervisor when choosing method — see contract
 * §5 "Reference photos (line item, captured at item entry)". Confirmed and shipped.
 */
function requestUploadUrl(
  lineItemId: string,
  fileExtension: string
): Promise<PhotoUploadUrlResponse> {
  return apiClient.post(`/api/order-line-items/${lineItemId}/reference-photo-upload-url`, {
    fileExtension,
  });
}

function confirmReferencePhotos(
  lineItemId: string,
  blobPaths: string[]
): Promise<{ referencePhotos: PhotoRef[] }> {
  // Field is named `photoUrls` in the contract even though it carries blob paths, not
  // URLs — matches the naming already used on the step-update endpoint.
  return apiClient.post(`/api/order-line-items/${lineItemId}/reference-photos`, {
    photoUrls: blobPaths,
  });
}

export type ReferencePhotoUploadResult = {
  localUri: string;
  success: boolean;
};

/**
 * Uploads every local reference photo captured for one line item. Tolerates individual
 * photo failures (network blip on one PUT) but treats the whole batch as failed if the
 * final confirm call doesn't go through, since the backend never learns about blobs it
 * wasn't told to confirm.
 */
export async function uploadReferencePhotosForLineItem(
  lineItemId: string,
  localUris: string[]
): Promise<ReferencePhotoUploadResult[]> {
  const results: ReferencePhotoUploadResult[] = [];
  const uploadedBlobPaths: string[] = [];

  for (const localUri of localUris) {
    try {
      const blobPath = await uploadPhotoToBlob(
        (ext) => requestUploadUrl(lineItemId, ext),
        localUri
      );
      uploadedBlobPaths.push(blobPath);
      results.push({ localUri, success: true });
    } catch {
      results.push({ localUri, success: false });
    }
  }

  if (uploadedBlobPaths.length > 0) {
    try {
      await confirmReferencePhotos(lineItemId, uploadedBlobPaths);
    } catch {
      return localUris.map((localUri) => ({ localUri, success: false }));
    }
  }

  return results;
}
