import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ClipboardList, Package, Menu as MenuIcon } from "lucide-react-native";
import { ManagerOrdersNavigator } from "../../features/orders/ManagerOrdersNavigator";
import { ProcurementDashboardScreen } from "../../features/rawMaterials/ProcurementDashboardScreen";
import { MenuNavigator } from "../MenuNavigator";
import { sharedTabScreenOptions } from "../tabBarOptions";

const Tab = createBottomTabNavigator();

export function StoreManagerTabs() {
  return (
    <Tab.Navigator screenOptions={sharedTabScreenOptions}>
      <Tab.Screen
        name="Orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      >
        {() => (
          <ManagerOrdersNavigator dashboardTitle="Orders Dashboard" canCreateOrders={false} />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="RawMaterials"
        component={ProcurementDashboardScreen}
        options={{
          title: "Raw Materials",
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="MenuTab"
        component={MenuNavigator}
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => <MenuIcon color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}
