import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";

import AuthHeader from "../Components/AuthHeader";
import FormInput from "../Components/FormInput";
import InfoBanner from "../Components/InfoBanner";
import PrimaryButton from "../../Common/Components/PrimaryButton";
import ScreenBackground from "../../Common/Components/ScreenBackground";

import { signUpWithEmail } from "../../Config/authService";
import {
  getFriendlyFirebaseError,
  getFirebaseErrorField,
} from "../../Config/firebaseErrors";

import apiClient from "../../Config/apiClient";
import { API_ENDPOINTS } from "../../Config/ApiEndpoint";

const SignUpScreen = ({ navigation }) => {
  // ---------- Form state ----------
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: "",
  });

  // ---------- Banner state ----------
  const [banner, setBanner] = useState({ type: null, message: "" });

  // ---------- Animation refs ----------
  const headerTranslateY = useRef(new Animated.Value(-30)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(40)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    headerTranslateY,
    headerOpacity,
    formTranslateY,
    formOpacity,
    footerOpacity,
  ]);

  // ---------- Password strength ----------
  const getPasswordStrength = (value) => {
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[0-9]/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;

    if (score <= 1) return { label: "Weak", level: 1, color: COLORS.error };
    if (score === 2) return { label: "Fair", level: 2, color: COLORS.warning };
    if (score === 3) return { label: "Good", level: 3, color: COLORS.info };
    return { label: "Strong", level: 4, color: COLORS.success };
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;

  // ---------- Validation ----------
  const validateFullName = (value) => {
    if (!value.trim()) return "Full name is required";
    if (value.trim().length <= 2)
      return "Name must be greater than 2 characters";
    if (!/^[a-zA-Z\s'-]+$/.test(value.trim()))
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    return "";
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) return "Email is required";
    if (!emailRegex.test(value.trim())) return "Enter a valid email address";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value)) return "Add at least one uppercase letter";
    if (!/[0-9]/.test(value)) return "Add at least one number";
    return "";
  };

  const validateConfirmPassword = (value, original) => {
    if (!value) return "Please confirm your password";
    if (value !== original) return "Passwords do not match";
    return "";
  };

  // ---------- Field change handlers ----------
  const clearFieldError = (field) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    if (banner.type) setBanner({ type: null, message: "" });
  };

  const handleFullNameChange = (value) => {
    setFullName(value);
    clearFieldError("fullName");
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    clearFieldError("email");
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    clearFieldError("password");
    if (confirmPassword) clearFieldError("confirmPassword");
  };

  const handleConfirmChange = (value) => {
    setConfirmPassword(value);
    clearFieldError("confirmPassword");
  };

  const handleTermsToggle = () => {
    setAgreeToTerms((prev) => !prev);
    if (errors.terms) setErrors((prev) => ({ ...prev, terms: "" }));
  };

  // ---------- Submit ----------
  const handleSignUp = async () => {
    // ---- 1) Local field validation ----
    const nameError = validateFullName(fullName);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const confirmError = validateConfirmPassword(confirmPassword, password);
    const termsError = agreeToTerms
      ? ""
      : "You must accept the Terms to continue";

    if (
      nameError ||
      emailError ||
      passwordError ||
      confirmError ||
      termsError
    ) {
      setErrors({
        fullName: nameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmError,
        terms: termsError,
      });
      setBanner({
        type: "error",
        message: "Please fix the highlighted fields.",
      });
      return;
    }

    // ---- 2) Clear previous state ----
    setErrors({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: "",
    });
    setIsLoading(true);
    setBanner({ type: null, message: "" });

    // ---- 3) Firebase signup ----
    let firebaseResult;
    try {
      firebaseResult = await signUpWithEmail(email, password, fullName);
    } catch (err) {
      setIsLoading(false);
      setBanner({
        type: "error",
        message:
          getFriendlyFirebaseError(err) ||
          "Something went wrong. Please try again.",
      });
      return;
    }

    // ---- 3a) Firebase error ----
    if (!firebaseResult.success) {
      const friendly = getFriendlyFirebaseError(firebaseResult.error);
      const field = getFirebaseErrorField(firebaseResult.error);

      if (field) {
        setErrors((prev) => ({ ...prev, [field]: friendly }));
      }
      setBanner({ type: "error", message: friendly });
      setIsLoading(false);
      return;
    }

    // ---- 4) Call FastAPI to save user record ----
    const apiResult = await apiClient.post(
      API_ENDPOINTS.USER.ADD_CREDENTIALS,
      { fullName: fullName.trim() },
      firebaseResult.token,
    );

    setIsLoading(false);

    // ---- 4a) API error ----
    if (!apiResult.success) {
      let userMessage = apiResult.message;

      if (apiResult.status === 409) {
        userMessage =
          "An account with this email already exists in our records. Please sign in instead.";
      } else if (apiResult.status === 401) {
        userMessage =
          "Authentication failed while saving your account. Please try signing up again.";
      }

      setBanner({ type: "error", message: userMessage });
      return;
    }

    // ---- 4b) API success ----
    setBanner({
      type: "success",
      message:
        "Account created! A verification email has been sent. Please check your inbox.",
    });

    setTimeout(() => {
      navigation?.navigate("LoginScreen");
    }, 3500);
  };

  const handleLoginRedirect = () => {
    navigation?.navigate("LoginScreen");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScreenBackground />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrap}>
            {/* ---------- Header ---------- */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: headerOpacity,
                  transform: [{ translateY: headerTranslateY }],
                },
              ]}
            >
              <AuthHeader
                iconName="person-add"
                title="Create Account"
                subtitle="Join us to calculate, predict, and manage your electricity bills."
              />
            </Animated.View>

            {/* ---------- Form Card ---------- */}
            <Animated.View
              style={[
                styles.formCard,
                {
                  opacity: formOpacity,
                  transform: [{ translateY: formTranslateY }],
                },
              ]}
            >
              <InfoBanner
                type={banner.type}
                message={banner.message}
                onHide={() => setBanner({ type: null, message: "" })}
              />

              <FormInput
                label="Full Name"
                value={fullName}
                onChangeText={handleFullNameChange}
                placeholder="Enter your full name"
                iconName="person-outline"
                error={errors.fullName}
                autoCapitalize="words"
                editable={!isLoading}
              />

              <FormInput
                label="Email"
                value={email}
                onChangeText={handleEmailChange}
                placeholder="you@example.com"
                iconName="mail-outline"
                error={errors.email}
                keyboardType="email-address"
                editable={!isLoading}
              />

              <FormInput
                label="Password"
                value={password}
                onChangeText={handlePasswordChange}
                placeholder="Create a strong password"
                iconName="lock-closed-outline"
                error={errors.password}
                isPassword
                editable={!isLoading}
                strength={passwordStrength}
              />

              <FormInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={handleConfirmChange}
                placeholder="Re-enter your password"
                iconName="shield-checkmark-outline"
                error={errors.confirmPassword}
                isPassword
                editable={!isLoading}
              />

              {/* Terms */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={handleTermsToggle}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    agreeToTerms && styles.checkboxChecked,
                  ]}
                >
                  {agreeToTerms ? (
                    <Ionicons name="checkmark" size={14} color={COLORS.white} />
                  ) : null}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{" "}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              {errors.terms ? (
                <Text style={styles.errorText}>{errors.terms}</Text>
              ) : null}

              <PrimaryButton
                title="Create Account"
                onPress={handleSignUp}
                iconName="person-add-outline"
                loading={isLoading}
                style={styles.submitButton}
              />
            </Animated.View>

            {/* ---------- Footer ---------- */}
            <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={handleLoginRedirect}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    justifyContent: "center",
  },
  contentWrap: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  formCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.medium,
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.xs,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.error,
    marginTop: SPACING.xxs,
    marginLeft: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  submitButton: {
    marginTop: SPACING.xs,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: SPACING.xl,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

export default SignUpScreen;
