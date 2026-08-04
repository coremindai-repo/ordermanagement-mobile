import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SupervisorOrdersDashboardScreen } from "./SupervisorOrdersDashboardScreen";
import { OrderDetailScreen } from "../orderDetail/OrderDetailScreen";
import { ItemStatusDetailScreen } from "../orderDetail/ItemStatusDetailScreen";
import { NotificationsScreen } from "../notifications/NotificationsScreen";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import type { OrdersStackParamList } from "./navigation";

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export function SupervisorOrdersNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.textPrimary }}>
      <Stack.Screen
        name="OrdersDashboard"
        component={SupervisorOrdersDashboardScreen}
        options={{ headerShown: false }}
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
