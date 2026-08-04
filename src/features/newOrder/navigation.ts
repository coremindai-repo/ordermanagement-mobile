import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type NewOrderStackParamList = {
  OrderTypePicker: undefined;
  CreateOrder: undefined;
  ItemEntry: { editItemId?: string } | undefined;
  ClaimInventory: undefined;
  OrderSubmitted: { orderNumber: string; photoFailureItemCount: number };
};

export type NewOrderScreenProps<T extends keyof NewOrderStackParamList> = NativeStackScreenProps<
  NewOrderStackParamList,
  T
>;
