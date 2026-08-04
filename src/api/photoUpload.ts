export type PhotoUploadUrlResponse = {
  uploadUrl: string;
  blobPath: string;
  expiresAt: string;
  requiredHeaders: Record<string, string>;
};

export type PhotoRef = { blobPath: string; url: string };

function extensionFromUri(uri: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(uri);
  return (match?.[1] ?? "jpg").toLowerCase();
}

function contentTypeForExtension(extension: string): string {
  switch (extension) {
    case "png":
      return "image/png";
    case "heic":
      return "image/heic";
    case "webp":
      return "image/webp";
    default:
      return "image/jpeg";
  }
}

async function putPhotoBytes(
  uploadUrl: string,
  requiredHeaders: Record<string, string>,
  localUri: string,
  contentType: string
): Promise<void> {
  const fileResponse = await fetch(localUri);
  const blob = await fileResponse.blob();
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { ...requiredHeaders, "Content-Type": contentType },
    body: blob,
  });
  if (!response.ok) {
    throw new Error(`Photo upload PUT failed with status ${response.status}`);
  }
}

/**
 * Shared SAS-upload mechanics for both reference photos and step photos — request a
 * write URL, PUT the bytes, return the blobPath. Confirmation (a separate call for
 * reference photos, folded into the next step-update call for step photos) is the
 * caller's job, since the two flows confirm differently.
 */
export async function uploadPhotoToBlob(
  requestUploadUrl: (fileExtension: string) => Promise<PhotoUploadUrlResponse>,
  localUri: string
): Promise<string> {
  const extension = extensionFromUri(localUri);
  const { uploadUrl, blobPath, requiredHeaders } = await requestUploadUrl(extension);
  await putPhotoBytes(uploadUrl, requiredHeaders, localUri, contentTypeForExtension(extension));
  return blobPath;
}
