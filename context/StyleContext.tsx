import React, { createContext, useContext, ReactNode } from "react";
import { StyleSheet, Platform, TextStyle } from "react-native";
import { fonts } from "../utils/fonts";

// Define our theme
export const theme = {
  colors: {
    primary: "#4F86E7",
    secondary: "#97B4F0",
    background: "#F9FAFC",
    text: "#333333",
    textLight: "#666666",
    border: "#E1E8F0",
    success: "#4CAF50",
    error: "#FF3333",
  },
  fonts,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  textStyles: StyleSheet.create({
    heading1: {
      fontFamily: fonts.regular,
      fontSize: 28,
      fontWeight: "bold",
      color: "#333333",
    },
    heading2: {
      fontFamily: fonts.regular,
      fontSize: 24,
      fontWeight: "bold",
      color: "#333333",
    },
    heading3: {
      fontFamily: fonts.regular,
      fontSize: 20,
      fontWeight: "bold",
      color: "#333333",
    },
    body: {
      fontFamily: fonts.regular,
      fontSize: 16,
      color: "#333333",
    },
    bodySmall: {
      fontFamily: fonts.regular,
      fontSize: 14,
      color: "#666666",
    },
    button: {
      fontFamily: fonts.regular,
      fontSize: 16,
      fontWeight: "bold",
      color: "white",
    },
  }),
  // Common styles that can be reused across the app
  commonStyles: StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F9FAFC",
    },
    section: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#E1E8F0",
    },
    card: {
      backgroundColor: "white",
      borderRadius: 10,
      padding: 16,
      marginBottom: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
    },
    centerContent: {
      justifyContent: "center",
      alignItems: "center",
    },
    primaryButton: {
      backgroundColor: "#4F86E7",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    primaryButtonText: {
      fontFamily: fonts.regular,
      color: "white",
      fontWeight: "bold",
      fontSize: 16,
    },
  }),
};

// Create context
const StyleContext = createContext(theme);

// Provider component
export const StyleProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <StyleContext.Provider value={theme}>{children}</StyleContext.Provider>
  );
};

// Hook to use the theme
export const useTheme = () => useContext(StyleContext);
