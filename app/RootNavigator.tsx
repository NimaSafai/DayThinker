import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import MainTabNavigator from "./MainTabNavigator";
import AuthNavigator from "./auth/AuthNavigator";
import { useAuth } from "../context/AuthContext";
import * as Font from "expo-font";

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { user, loading: authLoading, error } = useAuth();
  const [fontsLoaded, setFontsLoaded] = useState(true); // Default to true to skip font loading
  const [fontError, setFontError] = useState<string | null>(null);

  console.log("RootNavigator rendered", { user, authLoading, fontsLoaded });

  // Load fonts with timeout - skip for now
  /* 
  useEffect(() => {
    console.log("RootNavigator: Loading fonts");
    let isMounted = true;

    // Add timeout for font loading
    const timeoutId = setTimeout(() => {
      if (isMounted && !fontsLoaded) {
        console.log("Font loading timed out");
        setFontsLoaded(true);
      }
    }, 3000);

    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          Afacad: require("../assets/fonts/Afacad-Regular.ttf"),
        });
        if (isMounted) {
          console.log("Fonts loaded successfully");
          setFontsLoaded(true);
        }
      } catch (e) {
        console.error("Error loading fonts:", e);
        if (isMounted) {
          setFontError(e instanceof Error ? e.message : "Failed to load fonts");
          setFontsLoaded(true); // Continue anyway
        }
      }
    };

    loadFonts();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []);
  */

  // Modified to NOT block on authLoading
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#4F86E7" size="large" />
        <Text style={styles.loadingText}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFC",
  },
  loadingText: {
    marginTop: 10,
    color: "#4F86E7",
    fontSize: 16,
  },
});

export default RootNavigator;
