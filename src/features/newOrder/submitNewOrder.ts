import { createOrder } from "../../api/orders";
import { uploadReferencePhotosForLineItem } from "../../api/referencePhotos";
import type { OrderDetail } from "../../api/orderTypes";
import { buildCreateOrderRequest } from "./buildCreateOrderRequest";
import type { NewOrderDraft } from "./types";

export type PhotoUploadFailure = {
  itemName: string;
  failedCount: number;
};

export type SubmitNewOrderResult = {
  order: OrderDetail;
  photoFailures: PhotoUploadFailure[];
};

/**
 * Presented to the user as one atomic "Submit" even though it's two steps underneath
 * (CLAUDE.md §8): the order must exist before a line item has a real id to attach
 * reference photos to. If the reference-photo endpoint isn't live yet, or an upload
 * fails, the order itself has still been created successfully — that failure is
 * reported back rather than thrown, so the caller can surface it instead of hiding it.
 */
export async function submitNewOrder(draft: NewOrderDraft): Promise<SubmitNewOrderResult> {
  const { request, manufacturedItemPlan } = buildCreateOrderRequest(draft);
  const order = await createOrder(request);

  const photoFailures: PhotoUploadFailure[] = [];

  const itemsWithPhotos = manufacturedItemPlan.filter((entry) => entry.photoUris.length > 0);
  if (itemsWithPhotos.length === 0) {
    return { order, photoFailures };
  }

  // Correlate the response's flat lineItems array back to each draft item using the
  // same positional order they were sent in (assumption — the contract doesn't
  // explicitly guarantee response order mirrors request order). If the lengths don't
  // match, that assumption broke — don't guess which photo belongs to which item;
  // report every pending photo as failed instead of risking a wrong attachment.
  const requestLineItemCount = request.lineItems.length;
  if (order.lineItems.length !== requestLineItemCount) {
    for (const entry of itemsWithPhotos) {
      photoFailures.push({ itemName: entry.draftItemId, failedCount: entry.photoUris.length });
    }
    return { order, photoFailures };
  }

  let cursor = 0;
  for (const draftItem of draft.items) {
    if (draftItem.kind === "claimed") {
      cursor += 1;
      continue;
    }

    const planEntry = manufacturedItemPlan.find((entry) => entry.draftItemId === draftItem.id);
    const count = planEntry?.count ?? 0;
    const lineItemIdsForThisDraftItem = order.lineItems
      .slice(cursor, cursor + count)
      .map((li) => li.lineItemId);
    cursor += count;

    if (!planEntry || planEntry.photoUris.length === 0) {
      continue;
    }

    // Same photos apply to every identical unit from this one form fill (quantity fan-out).
    let failedCount = 0;
    for (const lineItemId of lineItemIdsForThisDraftItem) {
      const results = await uploadReferencePhotosForLineItem(lineItemId, planEntry.photoUris);
      failedCount += results.filter((result) => !result.success).length;
    }

    if (failedCount > 0) {
      photoFailures.push({ itemName: draftItem.itemName, failedCount });
    }
  }

  return { order, photoFailures };
}
