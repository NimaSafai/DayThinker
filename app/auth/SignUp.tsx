import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/StyleContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../types/navigation";

type SignUpScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  "SignUp"
>;

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const { signUp, loading, error } = useAuth();
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { colors } = useTheme();

  // Add effect to show auth errors
  useEffect(() => {
    if (error) {
      console.log("Auth Error in SignUp:", error);
      setLocalError(error);
    }
  }, [error]);

  const handleSignUp = async () => {
    console.log("SignUp pressed with:", { email, password });
    setPasswordError(null);
    setLocalError(null);

    // Validate email
    if (!email || !email.includes("@")) {
      setLocalError("Please enter a valid email address");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    // Check password match
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      console.log("Calling signUp with:", email);
      await signUp(email, password);
      console.log("SignUp completed, checking for errors");

      // If we get here without error and there's no error from auth context
      // Show a success message and redirect to login
      if (!error) {
        Alert.alert(
          "Verification Email Sent",
          "Please check your email to verify your account before logging in.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      }
    } catch (e) {
      console.error("Error in handleSignUp:", e);
      if (e instanceof Error) {
        setLocalError(e.message);
      } else {
        setLocalError("An unexpected error occurred");
      }
    }
  };

  // Display either local error or error from auth context
  const displayError = localError || error;

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

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Create Account
        </Text>

        {displayError && (
          <View style={[styles.errorContainer, { backgroundColor: "#FFEEEE" }]}>
            <Text style={[styles.errorText, { color: colors.error }]}>
              {displayError}
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

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.textLight }]}>
            Confirm Password
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: passwordError ? colors.error : colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor={colors.textLight + "80"}
          />
          {passwordError && (
            <Text
              style={[styles.errorText, { color: colors.error, marginTop: 4 }]}
            >
              {passwordError}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: loading ? "#AAAAAA" : colors.primary },
          ]}
          className="mt-10"
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textLight }]}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={[styles.footerLink, { color: colors.primary }]}>
              Log In
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
    backgroundColor: "#FFE5D6",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: "#FFE5D6",
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
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: "Afacad",
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
    borderRadius: 8,
  },
  errorText: {
    fontFamily: "Afacad",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: "Afacad",
    marginBottom: 4,
  },
  input: {
    fontFamily: "Afacad",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "white",
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
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
    marginTop: 24,
  },
  footerText: {
    fontFamily: "Afacad",
  },
  footerLink: {
    fontFamily: "Afacad",
    fontWeight: "600",
  },
});

export default SignUp;
