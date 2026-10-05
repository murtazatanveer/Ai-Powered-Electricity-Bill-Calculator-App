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

import { signInWithEmail, signOutUser } from "../../Config/authService";
import {
  getFriendlyFirebaseError,
  getFirebaseErrorField,
} from "../../Config/firebaseErrors";

const LoginScreen = ({ navigation }) => {
  // ---------- Form state ----------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

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

  // ---------- Validation ----------
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) return "Email is required";
    if (!emailRegex.test(value.trim())) return "Enter a valid email address";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
    if (banner.type) setBanner({ type: null, message: "" });
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
    if (banner.type) setBanner({ type: null, message: "" });
  };

  // ---------- Submit ----------
  const handleLogin = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      setBanner({
        type: "error",
        message: "Please complete the highlighted fields to continue.",
      });
      return;
    }

    setErrors({ email: "", password: "" });
    setIsLoading(true);
    setBanner({ type: null, message: "" });

    try {
      const result = await signInWithEmail(email, password);

      if (!result.success) {
        const friendly = getFriendlyFirebaseError(result.error);
        const field = getFirebaseErrorField(result.error);

        if (field) {
          setErrors((prev) => ({ ...prev, [field]: friendly }));
        }
        setBanner({ type: "error", message: friendly });
        return;
      }

      // Block unverified users
      if (!result.user.emailVerified) {
        await signOutUser();
        setBanner({
          type: "error",
          message:
            "Your email is not verified yet. Please check your inbox and click the verification link.",
        });
        return;
      }

      // Success → go to BillDataScreen (it checks for bill data and
      // redirects to Dashboard if the user is already set up)
      if (navigation?.replace) navigation.replace("BillDataScreen");
      else navigation?.navigate?.("BillDataScreen");
    } catch (err) {
      setBanner({
        type: "error",
        message:
          getFriendlyFirebaseError(err) ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation?.navigate("ForgotPasswordScreen");
  };

  const handleSignup = () => {
    navigation?.navigate("SignUpScreen");
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
                iconName="flash"
                title="Welcome Back"
                subtitle="Sign in to calculate, predict, and manage your electricity bills."
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
                placeholder="Enter your password"
                iconName="lock-closed-outline"
                error={errors.password}
                isPassword
                editable={!isLoading}
              />

              {/* Forgot Password link */}
              <View style={styles.forgotRow}>
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              <PrimaryButton
                title="Sign In"
                onPress={handleLogin}
                iconName="log-in-outline"
                loading={isLoading}
              />
            </Animated.View>

            {/* ---------- Footer ---------- */}
            <Animated.View style={[styles.footer, { opacity: footerOpacity }]}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={handleSignup} activeOpacity={0.7}>
                <Text style={styles.footerLink}>Sign Up</Text>
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
  forgotRow: {
    alignItems: "flex-end",
    marginTop: SPACING.xxs,
    marginBottom: SPACING.lg,
  },
  forgotText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
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

export default LoginScreen;
