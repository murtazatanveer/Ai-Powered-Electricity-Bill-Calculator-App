import { View, Text, Image, SafeAreaView, StatusBar } from "react-native";
import { useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import logo from "./assets/Logo.png";

export default function SplashScreen({ onAnimationComplete }) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  // Animation shared values
  const maskHeight = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  // Animation effect
  useEffect(() => {
    // Step 1: Reveal text from top to bottom (mask animation)
    maskHeight.value = withTiming(100, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    // Step 2: Fade in text slightly as it reveals
    textOpacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });

    // Step 3: Notify parent after animation completes
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Animated style for the text mask (reveals from top to bottom)
  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      height: `${maskHeight.value}%`,
      opacity: textOpacity.value,
      overflow: "hidden",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-primary-support">
      <StatusBar barStyle="dark-content" backgroundColor="#468432" />

      {/* Main Container - Centers content horizontally and vertically */}
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo + Text Group - Centered horizontally */}
        <View className="flex-row items-center justify-center gap-4 md:gap-6">
          {/* Logo - Static, no animation */}
          <Image
            source={logo}
            className="w-20 h-20 md:w-28 md:h-28"
            resizeMode="contain"
            style={{
              width: isSmallScreen ? 80 : 100,
              height: isSmallScreen ? 80 : 100,
            }}
          />

          {/* Text Container - Holds the animated text */}
          <View className="relative">
            {/* Static Text (invisible but holds layout space) */}
            <View className="opacity-0">
              <Text className="text-primary font-bold text-2xl md:text-4xl tracking-tight leading-tight max-w-[200px]">
                Electricity{"\n"}Bill Calculator
              </Text>
            </View>

            {/* Animated Text (reveals top to bottom) */}
            <Animated.View
              style={[animatedTextStyle, { position: "absolute" }]}
            >
              <Text className="text-primary font-bold text-2xl md:text-4xl tracking-tight leading-tight text-center max-w-[200px]">
                Electricity{"\n"}Bill Calculator
              </Text>
            </Animated.View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
