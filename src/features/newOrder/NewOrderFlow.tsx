import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NewOrderDraftProvider } from "./NewOrderDraftContext";
import { createDraft } from "./types";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import { OrderTypePickerScreen } from "./screens/OrderTypePickerScreen";
import { CreateOrderScreen } from "./screens/CreateOrderScreen";
import { ItemEntryScreen } from "./screens/ItemEntryScreen";
import { ClaimInventoryScreen } from "./screens/ClaimInventoryScreen";
import { OrderSubmittedScreen } from "./screens/OrderSubmittedScreen";
import type { NewOrderStackParamList } from "./navigation";

const Stack = createNativeStackNavigator<NewOrderStackParamList>();

/**
 * Owns the in-memory draft for one order-creation session (CLAUDE.md §5) — mounted
 * fresh each time the salesperson taps "+", unmounted (draft discarded) whenever this
 * whole flow is popped, whether by cancel or after a successful submit.
 */
export function NewOrderFlow() {
  return (
    <NewOrderDraftProvider initialDraft={createDraft("customer")}>
      <Stack.Navigator screenOptions={{ headerTintColor: colors.textPrimary }}>
        <Stack.Screen
          name="OrderTypePicker"
          component={OrderTypePickerScreen}
          options={{ headerShown: false, presentation: "transparentModal", animation: "fade" }}
        />
        <Stack.Screen
          name="CreateOrder"
          component={CreateOrderScreen}
          options={{ title: "Create Order", headerTitleStyle: { fontFamily: fonts.bold } }}
        />
        <Stack.Screen
          name="ItemEntry"
          component={ItemEntryScreen}
          options={{ title: "Item & Description", headerTitleStyle: { fontFamily: fonts.bold } }}
        />
        <Stack.Screen
          name="ClaimInventory"
          component={ClaimInventoryScreen}
          options={{ title: "Claim from Inventory", headerTitleStyle: { fontFamily: fonts.bold } }}
        />
        <Stack.Screen
          name="OrderSubmitted"
          component={OrderSubmittedScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NewOrderDraftProvider>
  );
}
