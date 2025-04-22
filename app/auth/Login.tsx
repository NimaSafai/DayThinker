import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/StyleContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types/navigation";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "Login"
>;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, loading, error } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { colors } = useTheme();

  const handleLogin = async () => {
    if (email && password) {
      await signIn(email, password);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.mainTitle, { color: colors.primary }]}>
            DayThink
          </Text>
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            Your daily journal companion
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Login</Text>

        {error && (
          <View style={[styles.errorContainer, { backgroundColor: "#FFEEEE" }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              {error}
            </Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.textLight }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={colors.textLight + "80"}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.textLight }]}>
            Password
          </Text>
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, color: colors.text },
            ]}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor={colors.textLight + "80"}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.primary },
            loading && styles.buttonDisabled,
          ]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textLight }]}>
            Don't have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: "center",
  },
  mainTitle: {
    fontFamily: "Afacad",
    fontSize: 48,
    fontWeight: "bold",
    color: "#4F86E7",
    marginBottom: 4,
  },
  title: {
    fontFamily: "Afacad",
    fontSize: 28,
    fontWeight: "bold",
    color: "#4F86E7",
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Afacad",
    color: "#777777",
    textAlign: "center",
  },
  sectionTitle: {
    fontFamily: "Afacad",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 24,
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#FFEEEE",
    borderRadius: 8,
  },
  errorText: {
    color: "#FF3333",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: "Afacad",
    color: "#666666",
    marginBottom: 4,
  },
  input: {
    fontFamily: "Afacad",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E1E8F0",
    borderRadius: 8,
    backgroundColor: "white",
  },
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#4F86E7",
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: "#AAAAAA",
  },
  buttonText: {
    fontFamily: "Afacad",
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  footerText: {
    fontFamily: "Afacad",
    color: "#666666",
  },
  footerLink: {
    fontFamily: "Afacad",
    color: "#4F86E7",
    fontWeight: "600",
  },
});

export default Login;
