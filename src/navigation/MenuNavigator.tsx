import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MenuScreen } from "../screens/common/MenuScreen";
import { PlaceholderScreen } from "../screens/common/PlaceholderScreen";
import { RawMaterialRequestsListScreen } from "../features/rawMaterials/RawMaterialRequestsListScreen";
import { NotificationsScreen } from "../features/notifications/NotificationsScreen";
import { OrderHistoryScreen } from "../features/orderHistory/OrderHistoryScreen";
import { SearchInventoryScreen } from "../screens/common/SearchInventoryScreen";
import { fonts } from "../theme/typography";
import { colors } from "../theme/colors";
import type { MenuStackParamList } from "./types";

const Stack = createNativeStackNavigator<MenuStackParamList>();

export function MenuNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.textPrimary }}>
      <Stack.Screen name="Menu" component={MenuScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="OrderHistory"
        component={OrderHistoryScreen}
        options={{ title: "Order History", headerTitleStyle: { fontFamily: fonts.bold } }}
      />
      <Stack.Screen
        name="Settings"
        options={{ title: "Settings", headerTitleStyle: { fontFamily: fonts.bold } }}
      >
        {() => <PlaceholderScreen title="Settings" />}
      </Stack.Screen>
      <Stack.Screen
        name="HelpSupport"
        options={{ title: "Help & Support", headerTitleStyle: { fontFamily: fonts.bold } }}
      >
        {() => <PlaceholderScreen title="Help & Support" />}
      </Stack.Screen>
      <Stack.Screen
        name="RawMaterials"
        component={RawMaterialRequestsListScreen}
        options={{ title: "Raw Materials", headerTitleStyle: { fontFamily: fonts.bold } }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notifications", headerTitleStyle: { fontFamily: fonts.bold } }}
      />
      <Stack.Screen
        name="SearchInventory"
        component={SearchInventoryScreen}
        options={{ title: "Search Inventory", headerTitleStyle: { fontFamily: fonts.bold } }}
      />
    </Stack.Navigator>
  );
}
