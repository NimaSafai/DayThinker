import * as Font from "expo-font";
import { Platform } from "react-native";
import {
  Afacad_400Regular,
  Afacad_500Medium,
  Afacad_600SemiBold,
  Afacad_700Bold,
} from "@expo-google-fonts/afacad";

// Define font family names for the app with fallbacks
export const fonts = {
  regular: Platform.select({
    web: "Afacad_400Regular, Arial, sans-serif",
    default: "Afacad_400Regular",
  }),
  medium: Platform.select({
    web: "Afacad_500Medium, Arial, sans-serif",
    default: "Afacad_500Medium",
  }),
  bold: Platform.select({
    web: "Afacad_700Bold, Arial, sans-serif",
    default: "Afacad_700Bold",
  }),
  light: Platform.select({
    web: "Afacad_400Regular, Arial, sans-serif",
    default: "Afacad_400Regular",
  }),
};

// Map font names to font weights
export const fontWeights = {
  regular: "normal" as const,
  medium: "500" as const,
  bold: "bold" as const,
  light: "300" as const,
};

// Load custom fonts with error handling
export const loadFonts = async () => {
  try {
    console.log("Starting font loading process with Google Fonts...");

    // Use the Expo Google Fonts
    await Font.loadAsync({
      // Use the named exports directly from the package
      Afacad_400Regular,
      Afacad_500Medium,
      Afacad_700Bold,
      Afacad_600SemiBold,
    });

    console.log("Google Fonts loaded successfully");
    return true;
  } catch (error) {
    console.error("Error loading Google Fonts:", error);
    console.error(
      "Font loading stack trace:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // Fall back to system fonts on error
    console.log("Falling back to system fonts");
    return false;
  }
};
