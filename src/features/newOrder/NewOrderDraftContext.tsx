import React, { createContext, useContext, useMemo, useReducer } from "react";
import { makeLocalId } from "../../utils/id";
import type { InventoryItem } from "../../api/orderTypes";
import {
  createDraft,
  emptyAddress,
  type ClaimedDraftItem,
  type DraftAddress,
  type ManufacturedDraftItem,
  type NewOrderDraft,
} from "./types";

type Action =
  | { type: "ADD_MANUFACTURED_ITEM"; item: Omit<ManufacturedDraftItem, "id" | "kind"> }
  | { type: "UPDATE_MANUFACTURED_ITEM"; id: string; item: Omit<ManufacturedDraftItem, "id" | "kind"> }
  | { type: "ADD_CLAIMED_ITEM"; inventoryItem: InventoryItem }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "SET_SAME_AS_BILLING"; value: boolean }
  | { type: "SET_BILL_TO"; address: DraftAddress }
  | { type: "SET_SHIP_TO"; address: DraftAddress }
  | { type: "SET_STORE_ID"; storeId: string | null }
  | { type: "RESET"; draft: NewOrderDraft };

function reducer(state: NewOrderDraft, action: Action): NewOrderDraft {
  switch (action.type) {
    case "ADD_MANUFACTURED_ITEM":
      return {
        ...state,
        items: [...state.items, { ...action.item, id: makeLocalId(), kind: "manufactured" }],
      };
    case "UPDATE_MANUFACTURED_ITEM":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.id ? { ...action.item, id: action.id, kind: "manufactured" } : item
        ),
      };
    case "ADD_CLAIMED_ITEM": {
      const claimed: ClaimedDraftItem = {
        id: makeLocalId(),
        kind: "claimed",
        claimLineItemId: action.inventoryItem.lineItemId,
        productName: action.inventoryItem.productName,
        status: action.inventoryItem.status,
        location: action.inventoryItem.location,
      };
      return { ...state, items: [...state.items, claimed] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((item) => item.id !== action.id) };
    case "SET_SAME_AS_BILLING": {
      const next = { ...state, sameAsBilling: action.value };
      if (action.value && state.billTo) {
        next.shipTo = state.billTo;
      }
      return next;
    }
    case "SET_BILL_TO": {
      const next = { ...state, billTo: action.address };
      if (state.sameAsBilling) {
        next.shipTo = action.address;
      }
      return next;
    }
    case "SET_SHIP_TO":
      return { ...state, shipTo: action.address, sameAsBilling: false };
    case "SET_STORE_ID":
      return { ...state, storeId: action.storeId };
    case "RESET":
      return action.draft;
    default:
      return state;
  }
}

type NewOrderDraftContextValue = {
  draft: NewOrderDraft;
  addManufacturedItem: (item: Omit<ManufacturedDraftItem, "id" | "kind">) => void;
  updateManufacturedItem: (id: string, item: Omit<ManufacturedDraftItem, "id" | "kind">) => void;
  addClaimedItem: (inventoryItem: InventoryItem) => void;
  removeItem: (id: string) => void;
  setSameAsBilling: (value: boolean) => void;
  setBillTo: (address: DraftAddress) => void;
  setShipTo: (address: DraftAddress) => void;
  setStoreId: (storeId: string | null) => void;
  reset: (draft: NewOrderDraft) => void;
};

const NewOrderDraftContext = createContext<NewOrderDraftContextValue | undefined>(undefined);

export function NewOrderDraftProvider({
  initialDraft,
  children,
}: {
  initialDraft: NewOrderDraft;
  children: React.ReactNode;
}) {
  const [draft, dispatch] = useReducer(reducer, initialDraft);

  const value = useMemo<NewOrderDraftContextValue>(
    () => ({
      draft,
      addManufacturedItem: (item) => dispatch({ type: "ADD_MANUFACTURED_ITEM", item }),
      updateManufacturedItem: (id, item) =>
        dispatch({ type: "UPDATE_MANUFACTURED_ITEM", id, item }),
      addClaimedItem: (inventoryItem) => dispatch({ type: "ADD_CLAIMED_ITEM", inventoryItem }),
      removeItem: (id) => dispatch({ type: "REMOVE_ITEM", id }),
      setSameAsBilling: (value) => dispatch({ type: "SET_SAME_AS_BILLING", value }),
      setBillTo: (address) => dispatch({ type: "SET_BILL_TO", address }),
      setShipTo: (address) => dispatch({ type: "SET_SHIP_TO", address }),
      setStoreId: (storeId) => dispatch({ type: "SET_STORE_ID", storeId }),
      reset: (nextDraft) => dispatch({ type: "RESET", draft: nextDraft }),
    }),
    [draft]
  );

  return <NewOrderDraftContext.Provider value={value}>{children}</NewOrderDraftContext.Provider>;
}

export function useNewOrderDraft(): NewOrderDraftContextValue {
  const ctx = useContext(NewOrderDraftContext);
  if (!ctx) {
    throw new Error("useNewOrderDraft must be used within a NewOrderDraftProvider");
  }
  return ctx;
}

export { emptyAddress };
