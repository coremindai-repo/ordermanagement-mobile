import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { OrdersDashboardScreen } from "./OrdersDashboardScreen";
import { NewOrderFlow } from "../newOrder/NewOrderFlow";
import { OrderDetailScreen } from "../orderDetail/OrderDetailScreen";
import { ItemStatusDetailScreen } from "../orderDetail/ItemStatusDetailScreen";
import { NotificationsScreen } from "../notifications/NotificationsScreen";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import type { OrdersStackParamList } from "./navigation";

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export function OrdersNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.textPrimary }}>
      <Stack.Screen
        name="OrdersDashboard"
        component={OrdersDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewOrder"
        component={NewOrderFlow}
        options={{ headerShown: false, presentation: "fullScreenModal" }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: "Order", headerTitleStyle: { fontFamily: fonts.bold } }}
      />
      <Stack.Screen
        name="ItemStatusDetail"
        component={ItemStatusDetailScreen}
        options={{ title: "Item", headerTitleStyle: { fontFamily: fonts.bold } }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Notifications", headerTitleStyle: { fontFamily: fonts.bold } }}
      />
    </Stack.Navigator>
  );
}
