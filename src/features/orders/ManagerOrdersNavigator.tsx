import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ManagerOrdersDashboardScreen } from "./ManagerOrdersDashboardScreen";
import { NewOrderFlow } from "../newOrder/NewOrderFlow";
import { OrderDetailScreen } from "../orderDetail/OrderDetailScreen";
import { ItemStatusDetailScreen } from "../orderDetail/ItemStatusDetailScreen";
import { NotificationsScreen } from "../notifications/NotificationsScreen";
import { colors } from "../../theme/colors";
import { fonts } from "../../theme/typography";
import type { OrdersStackParamList } from "./navigation";

const Stack = createNativeStackNavigator<OrdersStackParamList>();

/**
 * Shared by Store Manager and Company Manager — same dashboard (CLAUDE.md §4: "Company
 * Manager sees the same dashboard as Store Manager"). `canCreateOrders` gates the "+"
 * FAB and the NewOrder screen: contract §3's role-gating table permits company_manager
 * to create orders alongside salesperson, but not store_manager.
 */
export function ManagerOrdersNavigator({
  dashboardTitle,
  canCreateOrders,
}: {
  dashboardTitle: string;
  canCreateOrders: boolean;
}) {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: colors.textPrimary }}>
      <Stack.Screen name="OrdersDashboard" options={{ headerShown: false }}>
        {(props) => (
          <ManagerOrdersDashboardScreen
            {...props}
            title={dashboardTitle}
            canCreateOrders={canCreateOrders}
          />
        )}
      </Stack.Screen>
      {canCreateOrders ? (
        <Stack.Screen
          name="NewOrder"
          component={NewOrderFlow}
          options={{ headerShown: false, presentation: "fullScreenModal" }}
        />
      ) : null}
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
