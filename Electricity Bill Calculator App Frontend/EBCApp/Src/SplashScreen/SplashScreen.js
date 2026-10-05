import { useEffect, useRef } from "react";
import { StyleSheet, Animated, StatusBar } from "react-native";
import { COLORS, SPACING } from "../Theme/colors";
import BrandHeader from "../Common/Components/BrandHeader";
import ScreenBackground from "../Common/Components/ScreenBackground";

const SplashScreen = ({ navigation }) => {
  const scaleValue = useRef(new Animated.Value(0.3)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entry animation — scale + fade in
    Animated.parallel([
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Hold for a moment, then fade out and navigate
    const timer = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        navigation?.replace("WelcomeScreen");
      });
    }, 2700);

    return () => clearTimeout(timer);
  }, [navigation, scaleValue, opacityValue, screenOpacity]);

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScreenBackground variant="solid" />

      <Animated.View
        style={[
          styles.centerContent,
          {
            transform: [{ scale: scaleValue }],
            opacity: opacityValue,
          },
        ]}
      >
        <BrandHeader logoSize={140} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    paddingHorizontal: SPACING.xl,
  },
});

export default SplashScreen;
