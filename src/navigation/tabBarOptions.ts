import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { colors } from "../theme/colors";
import { fonts } from "../theme/typography";

export const sharedTabScreenOptions: BottomTabNavigationOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.textPrimary,
  tabBarInactiveTintColor: colors.textSecondary,
  tabBarLabelStyle: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    textTransform: "uppercase",
  },
  tabBarStyle: {
    borderTopColor: colors.border,
  },
};
