import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ClipboardList, Workflow, Menu as MenuIcon } from "lucide-react-native";
import { SupervisorOrdersNavigator } from "../../features/orders/SupervisorOrdersNavigator";
import { StagesNavigator } from "../../features/stages/StagesNavigator";
import { MenuNavigator } from "../MenuNavigator";
import { sharedTabScreenOptions } from "../tabBarOptions";

const Tab = createBottomTabNavigator();

export function FactorySupervisorTabs() {
  return (
    <Tab.Navigator screenOptions={sharedTabScreenOptions}>
      <Tab.Screen
        name="Orders"
        component={SupervisorOrdersNavigator}
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => <ClipboardList color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Stages"
        component={StagesNavigator}
        options={{
          title: "Stages",
          tabBarIcon: ({ color, size }) => <Workflow color={color} size={size} />,
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
