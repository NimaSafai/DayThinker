import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { fonts } from "../utils/fonts";

const FontTest = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Font Test</Text>

      <Text style={styles.header}>Using standard styles:</Text>

      <Text style={styles.regular}>
        Regular Text (fontFamily: "Afacad_400Regular")
      </Text>

      <Text style={styles.medium}>
        Medium Text (fontFamily: "Afacad_500Medium")
      </Text>

      <Text style={styles.semibold}>
        SemiBold Text (fontFamily: "Afacad_600SemiBold")
      </Text>

      <Text style={styles.bold}>Bold Text (fontFamily: "Afacad_700Bold")</Text>

      <Text style={styles.header}>Using the fonts object:</Text>

      <Text style={{ fontFamily: fonts.regular }}>
        Regular Text (using fonts.regular)
      </Text>

      <Text style={{ fontFamily: fonts.medium }}>
        Medium Text (using fonts.medium)
      </Text>

      <Text style={{ fontFamily: fonts.bold }}>
        Bold Text (using fonts.bold)
      </Text>

      <Text style={styles.systemFontFallback}>System Font Fallback</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "Afacad_700Bold",
    color: "#4F86E7",
  },
  header: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: "Afacad_700Bold",
    color: "#333",
  },
  regular: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Afacad_400Regular",
  },
  medium: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Afacad_500Medium",
  },
  semibold: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Afacad_600SemiBold",
  },
  bold: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: "Afacad_700Bold",
  },
  systemFontFallback: {
    fontSize: 16,
    marginTop: 16,
    fontFamily: Platform.OS === "ios" ? "System" : "Roboto",
    color: "#999",
  },
});

export default FontTest;
