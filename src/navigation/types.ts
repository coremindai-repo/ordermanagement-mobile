import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type AuthStackParamList = {
  SignIn: undefined;
  ForgotPassword: undefined;
};

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<
  AuthStackParamList,
  T
>;

/** Placeholder screens (Epic 2+ build these out) share this simple param shape. */
export type PlaceholderStackParamList = {
  Placeholder: { title: string };
};

export type MenuStackParamList = {
  Menu: undefined;
  OrderHistory: undefined;
  Settings: undefined;
  HelpSupport: undefined;
  RawMaterials: undefined;
  Notifications: undefined;
  SearchInventory: undefined;
};

export type MenuStackScreenProps<T extends keyof MenuStackParamList> = NativeStackScreenProps<
  MenuStackParamList,
  T
>;
