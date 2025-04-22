import "./global.css";
import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./context/AuthContext";
import { StyleProvider } from "./context/StyleContext";
import RootNavigator from "./app/RootNavigator";
import {
  LogBox,
  Text as RNText,
  View,
  ActivityIndicator,
  TextStyle,
  Platform,
  StyleSheet,
  ScrollView,
} from "react-native";
import { loadFonts, fonts, fontWeights } from "./utils/fonts";
import FontTest from "./components/FontTest";

// Override the default Text component with our font
// Using system fonts with appropriate weights
const Text = (props: any) => {
  // Determine the font weight based on props
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

  if (props.bold) fontWeight = "bold";
  else if (props.medium) fontWeight = "500";
  else if (props.light) fontWeight = "300";

  return (
    <RNText
      {...props}
      style={[
        // Apply system font with appropriate weight
        {
          fontFamily: fonts.regular,
          fontWeight,
        },
        // Then apply any custom styles
        props.style,
      ]}
    />
  );
};

// Ignore specific warnings (if needed)
LogBox.ignoreLogs([
  "ReactNativeFiberHostComponent: Unknown prop className",
  "NativeBase: The contrast ratio",
  "[react-native-gesture-handler]",
]);

export default function App() {
  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showFontTest, setShowFontTest] = useState(true); // Show font test by default

  useEffect(() => {
    const prepare = async () => {
      try {
        // More verbose logging for font loading
        console.log("Starting app preparation, about to load fonts...");
        console.log(`Platform: ${Platform.OS}, Version: ${Platform.Version}`);
        console.log("Configured fonts:", JSON.stringify(fonts, null, 2));

        // Try to load fonts but continue even if it fails
        const fontLoaded = await loadFonts();
        setFontsLoaded(fontLoaded);
        console.log("Font loading completed with result:", fontLoaded);

        if (!fontLoaded) {
          console.warn(
            "Fonts not loaded correctly, app will use fallback fonts"
          );
        }
      } catch (e) {
        console.warn("Error in font loading process:", e);
      } finally {
        // Continue with app loading regardless of font status
        setLoading(false);
      }
    };

    prepare();
  }, []);

  console.log("App component rendered, fonts loaded:", fontsLoaded);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F86E7" />
        <RNText style={styles.loadingText}>Loading...</RNText>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <StyleProvider>
        <View style={{ flex: 1 }}>
          {showFontTest && (
            <ScrollView style={styles.testContainer}>
              <FontTest />
              <RNText
                style={styles.dismissText}
                onPress={() => setShowFontTest(false)}
              >
                Tap here to dismiss font test
              </RNText>
            </ScrollView>
          )}
          {!showFontTest && (
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          )}
        </View>
        {loading && (
          <View
            className="absolute inset-0 bg-black/50 items-center justify-center"
            style={{
              zIndex: 9999,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            <ActivityIndicator size="large" color="#4F86E7" />
            <Text className="text-white mt-4">Loading...</Text>
          </View>
        )}
      </StyleProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFC",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#4F86E7",
    fontFamily: fonts.regular,
  },
  testContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  dismissText: {
    padding: 16,
    textAlign: "center",
    color: "#4F86E7",
    fontSize: 16,
  },
});
