import "./global.css";
import { useEffect, useRef } from "react";
import { Text, View, SafeAreaView, Animated, Easing } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function App() {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.parallel([
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      // Scale up
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
      // Slide up
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.quad),
      }),
    ]).start();

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ]),
    ).start();

    // Slow rotation for decorative element
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    ).start();
  }, []);

  // Interpolate rotation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <StatusBar style="light" />

      <View className="flex-1 items-center justify-center px-6">
        {/* Animated Background Decorative Elements */}
        <Animated.View
          style={{
            transform: [{ rotate: spin }],
            opacity: 0.15,
          }}
          className="absolute w-96 h-96 rounded-full border-4 border-purple-500"
        />
        <Animated.View
          style={{
            transform: [{ rotate: spin }],
            opacity: 0.1,
          }}
          className="absolute w-72 h-72 rounded-full border-4 border-blue-400"
        />

        {/* Glowing Light Bulb Icon */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="mb-8"
        >
          <View className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full items-center justify-center shadow-2xl shadow-yellow-500/50">
            <Text className="text-5xl">💡</Text>
          </View>
        </Animated.View>

        {/* Main Title */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: translateYAnim },
              { scale: pulseAnim },
            ],
          }}
          className="items-center"
        >
          <Text className="text-4xl font-bold text-center leading-tight">
            <Text className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              AI Powered
            </Text>
            {"\n"}
            <Text className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-300 to-orange-400">
              Electricity Bill
            </Text>
            {"\n"}
            <Text className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              Calculator App
            </Text>
          </Text>
        </Animated.View>

        {/* Animated Tagline */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          }}
          className="mt-6"
        >
          <View className="px-6 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
            <Text className="text-white/80 text-sm font-medium tracking-wider">
              ⚡ Smart · Fast · Accurate
            </Text>
          </View>
        </Animated.View>

        {/* Loading Bar Animation */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          }}
          className="mt-12 w-64"
        >
          <View className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <Animated.View
              style={{
                width: "60%",
                transform: [
                  {
                    translateX: useRef(new Animated.Value(-80)).current,
                  },
                ],
              }}
              className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 rounded-full"
            />
          </View>
          <Text className="text-white/40 text-center text-xs mt-2 tracking-wider">
            LOADING ASSETS...
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
