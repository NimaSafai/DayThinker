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
} from "react-native";
import { useAuth } from "../../context/AuthContext";
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
      style={{ flex: 1, backgroundColor: "#F9FAFC" }}
    >
      <View
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}
      >
        <View style={{ marginBottom: 32, alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "Afacad",
              fontSize: 28,
              fontWeight: "bold",
              color: "#4F86E7",
              marginBottom: 4,
            }}
          >
            DayThink
          </Text>
          <Text style={{ fontFamily: "Afacad", color: "#777777" }}>
            Your daily journal companion
          </Text>
        </View>

        <Text
          style={{
            fontFamily: "Afacad",
            fontSize: 24,
            fontWeight: "600",
            marginBottom: 24,
          }}
        >
          Create Account
        </Text>

        {displayError && (
          <View
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#FFEEEE",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#FF3333" }}>{displayError}</Text>
          </View>
        )}

        <View style={{ marginBottom: 16 }}>
          <Text
            style={{ fontFamily: "Afacad", color: "#666666", marginBottom: 4 }}
          >
            Email
          </Text>
          <TextInput
            style={{
              fontFamily: "Afacad",
              padding: 12,
              borderWidth: 1,
              borderColor: "#E1E8F0",
              borderRadius: 8,
              backgroundColor: "white",
            }}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text
            style={{ fontFamily: "Afacad", color: "#666666", marginBottom: 4 }}
          >
            Password
          </Text>
          <TextInput
            style={{
              fontFamily: "Afacad",
              padding: 12,
              borderWidth: 1,
              borderColor: "#E1E8F0",
              borderRadius: 8,
              backgroundColor: "white",
            }}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text
            style={{ fontFamily: "Afacad", color: "#666666", marginBottom: 4 }}
          >
            Confirm Password
          </Text>
          <TextInput
            style={{
              fontFamily: "Afacad",
              padding: 12,
              borderWidth: 1,
              borderColor: passwordError ? "#FF3333" : "#E1E8F0",
              borderRadius: 8,
              backgroundColor: "white",
            }}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          {passwordError && (
            <Text style={{ color: "#FF3333", marginTop: 4 }}>
              {passwordError}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={{
            padding: 12,
            borderRadius: 8,
            backgroundColor: loading ? "#AAAAAA" : "#4F86E7",
            alignItems: "center",
          }}
          onPress={handleSignUp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              style={{
                fontFamily: "Afacad",
                color: "white",
                fontWeight: "600",
                fontSize: 16,
              }}
            >
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 24,
          }}
        >
          <Text style={{ fontFamily: "Afacad", color: "#666666" }}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text
              style={{
                fontFamily: "Afacad",
                color: "#4F86E7",
                fontWeight: "600",
              }}
            >
              Log In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignUp;
