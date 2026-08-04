import type { NativeStackScreenProps } from "@react-navigation/native-stack";

/**
 * Shared by every navigator that hosts the Order Detail / Item Status Detail screens
 * (Salesperson, Store/Company Manager, Supervisor Orders, and the Stages dashboard) —
 * those two screens are typed against this one list, so each navigator registers only
 * the dashboard key it actually uses and leaves the rest unregistered.
 */
export type OrdersStackParamList = {
  OrdersDashboard: undefined;
  StagesDashboard: undefined;
  NewOrder: undefined;
  OrderDetail: { orderId: string };
  ItemStatusDetail: { orderId: string; lineItemId: string };
  Notifications: undefined;
};

export type OrdersScreenProps<T extends keyof OrdersStackParamList> = NativeStackScreenProps<
  OrdersStackParamList,
  T
>;
