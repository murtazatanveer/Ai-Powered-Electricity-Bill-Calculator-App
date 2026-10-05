import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
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

import FormInput from "../Components/FormInput";
import InfoBanner from "../Components/InfoBanner";
import PrimaryButton from "../../Common/Components/PrimaryButton";
import ScreenBackground from "../../Common/Components/ScreenBackground";
import HeaderWithBack from "../..//Common/Components/HeaderWithBack";

import { sendResetEmail } from "../../Config/authService";
import {
  getFriendlyFirebaseError,
  getFirebaseErrorField,
} from "../../Config/FirebaseConfig";

const ForgotPasswordScreen = ({ navigation }) => {
  // ---------- Form state ----------
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  // ---------- Banner state ----------
  const [banner, setBanner] = useState({ type: null, message: "" });

  // ---------- Animations ----------
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.9)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [headerOpacity, formTranslateY, formOpacity]);

  // ---------- Validation ----------
  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) return "Email is required";
    if (!emailRegex.test(value.trim())) return "Enter a valid email address";
    return "";
  };

  const handleEmailChange = (value) => {
    setEmail(value);
    if (emailError) setEmailError("");
    if (banner.type) setBanner({ type: null, message: "" });
  };

  // ---------- Submit ----------
  const handleSendReset = async () => {
    const localError = validateEmail(email);
    if (localError) {
      setEmailError(localError);
      setBanner({ type: "error", message: localError });
      return;
    }

    setEmailError("");
    setIsLoading(true);
    setBanner({ type: null, message: "" });

    try {
      const result = await sendResetEmail(email);

      if (!result.success) {
        const friendly = getFriendlyFirebaseError(result.error);
        const field = getFirebaseErrorField(result.error);

        if (field === "email") setEmailError(friendly);
        setBanner({ type: "error", message: friendly });
        return;
      }

      console.log("=== Password Reset Email Sent ===");
      console.log("To:", email.trim());
      console.log("=================================");

      setBanner({
        type: "success",
        message:
          "Reset link sent! Check your inbox and follow the link to set a new password.",
      });
      setIsSent(true);

      successScale.setValue(0.9);
      successOpacity.setValue(0);
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 14,
          stiffness: 160,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
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

  const handleResend = () => {
    setIsSent(false);
    successOpacity.setValue(0);
    successScale.setValue(0.9);
  };

  const handleBack = () => {
    if (navigation?.goBack) navigation.goBack();
    else navigation?.navigate?.("LoginScreen");
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
            {/* ---------- Header with back ---------- */}
            <Animated.View
              style={[styles.headerWrap, { opacity: headerOpacity }]}
            >
              <HeaderWithBack
                title="Forgot Password"
                subtitle="We'll send a reset link to your email."
                onBack={handleBack}
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

              {!isSent ? (
                <>
                  {/* ---------- Info block ---------- */}
                  <View style={styles.infoBlock}>
                    <View style={styles.infoIconWrap}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={22}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.infoTextWrap}>
                      <Text style={styles.infoTitle}>Reset your password</Text>
                      <Text style={styles.infoText}>
                        Enter the email linked to your account. We'll send you a
                        secure link to choose a new password. Your current
                        password will stay active until you complete the reset.
                      </Text>
                    </View>
                  </View>

                  <FormInput
                    label="Email"
                    value={email}
                    onChangeText={handleEmailChange}
                    placeholder="you@example.com"
                    iconName="mail-outline"
                    error={emailError}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                  />

                  <PrimaryButton
                    title="Send Reset Link"
                    onPress={handleSendReset}
                    iconName="paper-plane-outline"
                    loading={isLoading}
                    style={styles.submitButton}
                  />

                  {/* ---------- Steps hint ---------- */}
                  <View style={styles.stepsWrap}>
                    <Text style={styles.stepsTitle}>How it works</Text>

                    <View style={styles.stepRow}>
                      <View style={styles.stepDot} />
                      <Text style={styles.stepText}>
                        Check your inbox for our email
                      </Text>
                    </View>
                    <View style={styles.stepRow}>
                      <View style={styles.stepDot} />
                      <Text style={styles.stepText}>
                        Tap the link to open the reset page
                      </Text>
                    </View>
                    <View style={styles.stepRow}>
                      <View style={styles.stepDot} />
                      <Text style={styles.stepText}>
                        Choose a new password and sign in
                      </Text>
                    </View>

                    {/* ---------- Bottom note ---------- */}
                    <View style={styles.noteWrap}>
                      <Ionicons
                        name="information-circle-outline"
                        size={14}
                        color={COLORS.textLight}
                      />
                      <Text style={styles.noteText}>
                        Didn't get the email? Check your Inbox, or try again in
                        a minute. The link expires in 1 hour.
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <Animated.View
                  style={[
                    styles.successBlock,
                    {
                      opacity: successOpacity,
                      transform: [{ scale: successScale }],
                    },
                  ]}
                >
                  <View style={styles.successIconWrap}>
                    <Ionicons
                      name="mail-open-outline"
                      size={40}
                      color={COLORS.primary}
                    />
                  </View>

                  <Text style={styles.successTitle}>Check your inbox</Text>
                  <Text style={styles.successMessage}>
                    We've sent a password reset link to{" "}
                    <Text style={styles.successEmail}>{email.trim()}</Text>.
                    {"\n\n"}
                    Follow the link to set a new password. If you don't see the
                    email, check your spam folder.
                  </Text>

                  <PrimaryButton
                    title="Send to a different email"
                    onPress={handleResend}
                    iconName="refresh-outline"
                    variant="outline"
                    style={styles.resendButton}
                  />
                </Animated.View>
              )}
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
    paddingTop: SPACING.xl + SPACING.md,
    paddingBottom: SPACING.xl,
    justifyContent: "flex-start",
  },
  contentWrap: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  headerWrap: {
    marginBottom: SPACING.lg,
  },
  formCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.medium,
  },
  submitButton: {
    marginTop: SPACING.xs,
  },

  // ---------- Info block ----------
  infoBlock: {
    flexDirection: "row",
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryFade,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrap: {
    flex: 1,
  },
  infoTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },

  // ---------- Steps hint ----------
  stepsWrap: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  stepsTitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: SPACING.xxs,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.primary,
  },
  stepText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // ---------- Bottom note ----------
  noteWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  noteText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textPrimary,
    lineHeight: 16,
  },

  // ---------- Success block ----------
  successBlock: {
    alignItems: "center",
    paddingVertical: SPACING.md,
  },
  successIconWrap: {
    width: 84,
    height: 84,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.primaryFade,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  successTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    marginBottom: SPACING.xs,
  },
  successMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  successEmail: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  resendButton: {
    width: "100%",
  },
});

export default ForgotPasswordScreen;
