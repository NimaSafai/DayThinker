import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./context/AuthContext";
import RootNavigator from "./app/RootNavigator";
import { LogBox } from "react-native";

// Ignore specific warnings (if needed)
LogBox.ignoreLogs([
  "ReactNativeFiberHostComponent: Unknown prop className",
  "NativeBase: The contrast ratio",
  "[react-native-gesture-handler]",
]);

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
