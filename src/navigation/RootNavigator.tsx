import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../auth/AuthContext";
import { AuthNavigator } from "./AuthNavigator";
import { SalespersonTabs } from "./roleTabs/SalespersonTabs";
import { FactorySupervisorTabs } from "./roleTabs/FactorySupervisorTabs";
import { StoreManagerTabs } from "./roleTabs/StoreManagerTabs";
import { CompanyManagerTabs } from "./roleTabs/CompanyManagerTabs";
import { resolvePrimaryRole } from "./resolveRole";
import { colors } from "../theme/colors";

function RoleTabs() {
  const { user } = useAuth();
  const primaryRole = user ? resolvePrimaryRole(user.roles) : null;

  switch (primaryRole) {
    case "company_manager":
      return <CompanyManagerTabs />;
    case "store_manager":
      return <StoreManagerTabs />;
    case "factory_supervisor":
      return <FactorySupervisorTabs />;
    case "salesperson":
    default:
      return <SalespersonTabs />;
  }
}

export function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <RoleTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
