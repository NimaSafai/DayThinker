import React from "react";
import { Text, TextProps, StyleSheet, Platform } from "react-native";
import { fonts } from "../utils/fonts";

interface AppTextProps extends TextProps {
  bold?: boolean;
  medium?: boolean;
  light?: boolean;
  center?: boolean;
  style?: any;
}

const AppText: React.FC<AppTextProps> = ({
  bold,
  medium,
  light,
  center,
  style,
  children,
  ...props
}) => {
  // Determine font weight based on props
  let fontWeight:
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900" = "normal";

  if (bold) fontWeight = "bold";
  else if (medium) fontWeight = "500";
  else if (light) fontWeight = "300";

  return (
    <Text
      style={[
        styles.defaultText,
        center && styles.center,
        // Apply appropriate font weight
        { fontWeight },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontSize: 16,
    color: "#333333",
    fontFamily: fonts.regular,
  },
  center: {
    textAlign: "center",
  },
});

export default AppText;
