import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
  const { signUp, loading, error } = useAuth();
  const navigation = useNavigation<SignUpScreenNavigationProp>();

  const handleSignUp = async () => {
    setPasswordError(null);
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (email && password) {
      await signUp(email, password);
    }
  };

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

        {error && (
          <View
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: "#FFEEEE",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#FF3333" }}>{error}</Text>
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
