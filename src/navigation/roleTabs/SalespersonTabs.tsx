import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Search, ClipboardList, Menu as MenuIcon } from "lucide-react-native";
import { SearchInventoryScreen } from "../../screens/common/SearchInventoryScreen";
import { OrdersNavigator } from "../../features/orders/OrdersNavigator";
import { MenuNavigator } from "../MenuNavigator";
import { sharedTabScreenOptions } from "../tabBarOptions";

const Tab = createBottomTabNavigator();

export function SalespersonTabs() {
  return (
    <Tab.Navigator screenOptions={sharedTabScreenOptions}>
      <Tab.Screen
        name="SearchInventory"
        component={SearchInventoryScreen}
        options={{
          title: "Search Inventory",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersNavigator}
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
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
