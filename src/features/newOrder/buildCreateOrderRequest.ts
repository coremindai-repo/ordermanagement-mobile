import type {
  CreateOrderRequest,
  DimensionsInput,
  FreeForm,
  NewOrderLineItemInput,
} from "../../api/orderTypes";
import type { DraftAddress, ManufacturedDraftItem, NewOrderDraft } from "./types";

// Structured fields, confirmed contract addition (CLAUDE.md §8) — dimensions/finish get
// real columns server-side, unlike `materials` which stays free-form JSON. Axes are
// optional individually, but the contract requires every value sent to be > 0 — so
// omitted axes must be left out entirely, not sent as 0.
function buildDimensions(item: ManufacturedDraftItem): DimensionsInput | null {
  const { length, breadth, height, unit } = item.dimensions;
  const dimensions: DimensionsInput = { unit };
  let hasAny = false;

  if (Number(length) > 0) {
    dimensions.length = Number(length);
    hasAny = true;
  }
  if (Number(breadth) > 0) {
    dimensions.breadth = Number(breadth);
    hasAny = true;
  }
  if (Number(height) > 0) {
    dimensions.height = Number(height);
    hasAny = true;
  }

  return hasAny ? dimensions : null;
}

function buildMaterials(item: ManufacturedDraftItem): FreeForm[] {
  return item.materials
    .filter((entry) => entry.material.trim().length > 0)
    .map((entry) => ({ material: entry.material.trim(), type: entry.type.trim() }));
}

function addressToFreeForm(address: DraftAddress): FreeForm {
  return { ...address };
}

export type ManufacturedItemPlanEntry = {
  draftItemId: string;
  /** How many identical lineItems entries this draft item expanded into (quantity fan-out). */
  count: number;
  photoUris: string[];
};

export type BuiltOrderRequest = {
  request: CreateOrderRequest;
  /** In draft.items order, manufactured entries only — used to correlate the response's
   * lineItems back to each draft item's local photos. See submitNewOrder.ts. */
  manufacturedItemPlan: ManufacturedItemPlanEntry[];
};

export function buildCreateOrderRequest(draft: NewOrderDraft): BuiltOrderRequest {
  const lineItems: NewOrderLineItemInput[] = [];
  const manufacturedItemPlan: ManufacturedItemPlanEntry[] = [];

  for (const item of draft.items) {
    if (item.kind === "claimed") {
      lineItems.push({ claimLineItemId: item.claimLineItemId });
      continue;
    }

    const dimensions = buildDimensions(item);
    const finish = item.finish.trim() || null;
    const materials = buildMaterials(item);

    for (let i = 0; i < item.quantity; i++) {
      lineItems.push({
        itemName: item.itemName,
        dimensions,
        finish,
        materials: materials.length > 0 ? materials : undefined,
      });
    }

    manufacturedItemPlan.push({
      draftItemId: item.id,
      count: item.quantity,
      photoUris: item.photoUris,
    });
  }

  const request: CreateOrderRequest = {
    orderType: draft.orderType,
    storeId: draft.storeId ?? undefined,
    lineItems,
  };

  if (draft.orderType === "customer") {
    if (draft.billTo) request.billTo = addressToFreeForm(draft.billTo);
    if (draft.shipTo) request.shipTo = addressToFreeForm(draft.shipTo);
  }

  return { request, manufacturedItemPlan };
}
