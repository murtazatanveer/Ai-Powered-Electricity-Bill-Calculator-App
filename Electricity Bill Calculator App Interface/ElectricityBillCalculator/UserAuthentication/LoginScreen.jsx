// src/UserAuthentication/LoginScreen.js
import { useState, useEffect } from "react";
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
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

import COLORS from "../Components/Colors";
import Logo from "./Logo";
import { auth } from "../firebase-config";
import CustomAlert from "./Components/CustomAlert";
import LoginSkeleton from "./Components/LoginSkeleton";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isCheckingStorage, setIsCheckingStorage] = useState(true);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    type: "info",
    buttonText: "OK",
    onAction: null,
  });

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

  useEffect(() => {
    const checkSavedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem("userEmail");
        const savedPass = await AsyncStorage.getItem("userPassword");

        if (savedEmail && savedPass) {
          try {
            const res = await signInWithEmailAndPassword(
              auth,
              savedEmail,
              savedPass,
            );

            if (res.user.emailVerified) {
              // ✅ UPDATE: Navigate to the Drawer Wrapper
              navigation.replace("AppDrawer");
              return;
            } else {
              await AsyncStorage.multiRemove(["userEmail", "userPassword"]);
              showGlassAlert(
                "Email Not Verified",
                "Please verify your email before logging in.",
                "error",
              );
            }
          } catch {
            await AsyncStorage.multiRemove(["userEmail", "userPassword"]);
          }
        }
      } catch {}

      setIsCheckingStorage(false);
    };

    checkSavedCredentials();
  }, []);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      showGlassAlert("Error", "Please enter both email and password.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);

      if (!res.user.emailVerified) {
        showGlassAlert(
          "Email Not Verified",
          "Please check your inbox/spam folder and click the verification link before logging in.",
          "error",
        );
        await signOut(auth);
        setLoading(false);
        return;
      }

      if (rememberMe) {
        await AsyncStorage.setItem("userEmail", email);
        await AsyncStorage.setItem("userPassword", password);
      } else {
        await AsyncStorage.multiRemove(["userEmail", "userPassword"]);
      }

      // ✅ UPDATE: Navigate to the Drawer Wrapper
      navigation.replace("AppDrawer");
    } catch (err) {
      let errorMsg = "Login failed. Please try again.";

      switch (err.code) {
        case "auth/invalid-credential":
        case "auth/wrong-password":
          errorMsg = "Invalid email or password";
          break;
        case "auth/invalid-email":
          errorMsg = "Invalid email format";
          break;
        case "auth/user-disabled":
          errorMsg = "This account has been disabled";
          break;
        case "auth/user-not-found":
          errorMsg = "No account found with this email";
          break;
        case "auth/too-many-requests":
          errorMsg = "Too many failed attempts. Try again later";
          break;
        case "auth/network-request-failed":
          errorMsg = "Network error. Check your connection";
          break;
        default:
          errorMsg = `Login failed (${err.code})`;
      }
      showGlassAlert("Login Failed", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Show the Skeleton Loading while checking storage
  if (isCheckingStorage) {
    return <LoginSkeleton />;
  }

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
            <Logo name="Log In" />

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

            <View style={styles.rememberRow}>
              <TouchableOpacity
                style={styles.rememberTouchable}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View
                  style={[styles.checkbox, rememberMe && styles.checkboxActive]}
                >
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberText}>Remember Me</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgotten Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.7 }]}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? "Logging in..." : "Log In"}
              </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
                <Text style={styles.createAccountText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttonText={alertConfig.buttonText}
        onPress={() => {
          setAlertVisible(false);
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
  rememberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 4,
  },
  rememberTouchable: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: COLORS.primarySupport,
    borderColor: COLORS.primarySupport,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  rememberText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  forgotText: {
    color: COLORS.primarySupport,
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
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
  loginButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    color: COLORS.primary,
    fontSize: 14,
    opacity: 0.7,
  },
  createAccountText: {
    color: COLORS.primarySupport,
    fontSize: 14,
    fontWeight: "700",
  },
});
