import { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
} from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../Theme/colors";
import BrandHeader from "../Common/Components/BrandHeader";
import PrimaryButton from "../Common/Components/PrimaryButton";
import ScreenBackground from "../Common/Components/ScreenBackground";

const WelcomeScreen = ({ navigation }) => {
  const bottomBarSlide = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(bottomBarSlide, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();

    Animated.timing(contentFade, {
      toValue: 1,
      duration: 600,
      delay: 700,
      useNativeDriver: true,
    }).start();
  }, [bottomBarSlide, contentFade]);

  // ---------- Navigation ----------
  const handleSignUp = () => {
    navigation?.navigate("SignUpScreen");
  };

  const handleLogin = () => {
    navigation?.navigate("LoginScreen");
  };

  const translateY = bottomBarSlide.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Decorative corner circles (fade variant, subtle) */}
      <ScreenBackground />

      <View style={styles.container}>
        {/* Top Section — brand header */}
        <View style={styles.topSection}>
          <BrandHeader logoSize={180} />
        </View>

        {/* Bottom Section — CTA card */}
        <Animated.View
          style={[styles.bottomSection, { transform: [{ translateY }] }]}
        >
          <Animated.View style={[styles.welcomeCard, { opacity: contentFade }]}>
            <Text style={styles.welcomeTitle}>Welcome</Text>

            <Text style={styles.welcomeDescription}>
              Calculate your electricity bill with ease and track your energy
              usage. Get smart predictions and insights to manage your
              electricity better.
            </Text>

            <View style={styles.buttonRow}>
              {/* Sign Up — outline variant (white bg, green border/text) */}
              <View style={styles.buttonSlot}>
                <PrimaryButton
                  title="Sign Up"
                  onPress={handleSignUp}
                  iconName="person-add-outline"
                  variant="outline"
                  style={styles.welcomeButton}
                />
              </View>

              {/* Login — solid darker green, white border/text */}
              <View style={styles.buttonSlot}>
                <PrimaryButton
                  title="Login"
                  onPress={handleLogin}
                  iconName="log-in-outline"
                  style={[styles.welcomeButton, styles.welcomeLogin]}
                />
              </View>
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  topSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
  },
  bottomSection: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxl,
    justifyContent: "flex-start",
    overflow: "hidden",
  },
  welcomeCard: {
    flex: 1,
    justifyContent: "center",
  },
  welcomeTitle: {
    fontSize: TYPOGRAPHY.sizes.display,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textWhite,
    marginBottom: SPACING.md,
  },
  welcomeDescription: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.white,
    opacity: 0.9,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  buttonRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  buttonSlot: {
    flex: 1,
  },
  welcomeButton: {
    height: 56,
    borderRadius: BORDER_RADIUS.circle,
  },
  welcomeLogin: {
    backgroundColor: COLORS.primaryDark,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
});

export default WelcomeScreen;
