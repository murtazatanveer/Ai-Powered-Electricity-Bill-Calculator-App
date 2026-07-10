import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

import COLORS from "../Components/Colors";
import Logo from "./Logo";
import { auth } from "../firebase-config";
import CustomAlert from "./CustomAlert"; // <-- Import Glass Pop-up

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- POP-UP STATE ---
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info", // "info", "success", "error"
    buttonText: "OK",
    onAction: null,
  });

  // Helper function to trigger the glass pop-up
  const showGlassAlert = (
    title,
    message,
    type = "info",
    buttonText = "OK",
    onAction = null,
  ) => {
    setAlertConfig({ title, message, type, buttonText, onAction });
    setAlertVisible(true);
  };

  // --- EMAIL SIGNUP LOGIC ---
  const handleEmailSignup = async () => {
    if (!email || !password || !confirmPassword) {
      showGlassAlert("Error", "Please fill in all fields.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showGlassAlert("Error", "Passwords do not match.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      // ✅ Send Email Verification
      await sendEmailVerification(res.user);

      showGlassAlert(
        "Verification Sent",
        "Verification email sent! Please check your inbox/spam folder to verify your email before logging in.",
        "success",
        "Go to Login",
        () => navigation.navigate("Login"),
      );

      // Force sign out so they must verify before logging in
      await signOut(auth);
    } catch (err) {
      let errorMsg = "Signup failed. Please try again.";

      // ✅ Detailed error handling switch
      switch (err.code) {
        case "auth/email-already-in-use":
          errorMsg = "Email already exists. Try logging in.";
          break;
        case "auth/invalid-email":
          errorMsg = "Invalid email format";
          break;
        case "auth/weak-password":
          errorMsg = "Password should be at least 6 characters";
          break;
        case "auth/missing-password":
          errorMsg = "Password is required";
          break;
        case "auth/network-request-failed":
          errorMsg = "Network error. Check internet connection";
          break;
        case "auth/operation-not-allowed":
          errorMsg = "Email/password authentication is disabled";
          break;
        case "auth/too-many-requests":
          errorMsg = "Too many requests. Try again later";
          break;
        default:
          errorMsg = `Signup failed (${err.code})`;
      }
      showGlassAlert("Signup Failed", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 40}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          <View style={styles.mainContent}>
            {/* Logo Area */}
            <Logo name="Create Account" />

            {/* Email Input Field */}
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="email-outline"
                size={24}
                color={COLORS.primary}
                style={styles.inputIcon}
              />
              <View style={styles.inputTextContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Enter your email"
                  placeholderTextColor="#8A9B7A"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Password Input Field */}
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={24}
                color={COLORS.primary}
                style={styles.inputIcon}
              />
              <View style={styles.inputTextContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#8A9B7A"
                  editable={!loading}
                />
              </View>
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialCommunityIcons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color={COLORS.primary}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password Input Field */}
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="lock-check-outline"
                size={24}
                color={COLORS.primary}
                style={styles.inputIcon}
              />
              <View style={styles.inputTextContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.textInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#8A9B7A"
                  editable={!loading}
                />
              </View>
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialCommunityIcons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color={COLORS.primary}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[styles.signUpButton, loading && { opacity: 0.7 }]}
              onPress={handleEmailSignup}
              disabled={loading}
            >
              <Text style={styles.signUpButtonText}>
                {loading ? "Creating Account..." : "Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* ✅ SIMPLE FOOTER (Divider Removed) */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Do you have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLinkText}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Spacer to prevent footer wall */}
          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 🪟 GLASSMORPHISM POP-UP COMPONENT */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttonText={alertConfig.buttonText}
        onPress={() => {
          setAlertVisible(false);
          // Run the custom action if provided (e.g., navigate to Login)
          if (alertConfig.onAction) {
            alertConfig.onAction();
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },

  // Input Styles
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputTextContainer: {
    flex: 1,
  },
  inputLabel: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
    opacity: 0.6,
  },
  textInput: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "500",
    padding: 0,
  },
  eyeIcon: {
    opacity: 0.6,
  },

  // Sign Up Button
  signUpButton: {
    backgroundColor: COLORS.primarySupport,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 24,
  },
  signUpButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Footer
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    color: COLORS.primary,
    fontSize: 14,
    opacity: 0.7,
  },
  loginLinkText: {
    color: COLORS.primarySupport,
    fontSize: 14,
    fontWeight: "700",
  },
});
