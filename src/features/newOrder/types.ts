import type { OrderType } from "../../api/orderTypes";

export type LengthUnit = "m" | "cm";

export type Dimensions = {
  length: string;
  breadth: string;
  height: string;
  unit: LengthUnit;
};

export type MaterialEntry = {
  id: string;
  material: string;
  type: string;
};

export type ManufacturedDraftItem = {
  id: string;
  kind: "manufactured";
  itemName: string;
  quantity: number;
  dimensions: Dimensions;
  materials: MaterialEntry[];
  finish: string;
  /** Local file URIs from expo-image-picker — uploaded only after order submission. */
  photoUris: string[];
  priority: boolean;
};

export type ClaimedDraftItem = {
  id: string;
  kind: "claimed";
  claimLineItemId: string;
  productName: string;
  status: "finished" | "semi_finished";
  location: string;
};

export type DraftItem = ManufacturedDraftItem | ClaimedDraftItem;

export type DraftAddress = {
  receiversName: string;
  receiversAddress: string;
  country: string;
  state: string;
  cityTown: string;
  postalCode: string;
  /** Ship-to only, per the wireframe. */
  expectedShipmentDate?: string;
};

export type NewOrderDraft = {
  orderType: OrderType;
  items: DraftItem[];
  billTo: DraftAddress | null;
  shipTo: DraftAddress | null;
  sameAsBilling: boolean;
  storeId: string | null;
};

export const emptyAddress: DraftAddress = {
  receiversName: "",
  receiversAddress: "",
  country: "",
  state: "",
  cityTown: "",
  postalCode: "",
};

export function createDraft(orderType: OrderType): NewOrderDraft {
  return {
    orderType,
    items: [],
    billTo: null,
    shipTo: null,
    sameAsBilling: true,
    storeId: null,
  };
}
