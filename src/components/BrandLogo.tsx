import React from "react";
import { View } from "react-native";
import { SvgXml } from "react-native-svg";
import { NILAMBUR_LOGO_XML } from "../assets/nilamburLogo";

/** Real vector mark, from design/00-auth/Nilambur_logo.svg. */
export function BrandLogo({ size = 120 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 8, overflow: "hidden" }}>
      <SvgXml xml={NILAMBUR_LOGO_XML} width={size} height={size} />
    </View>
  );
}
