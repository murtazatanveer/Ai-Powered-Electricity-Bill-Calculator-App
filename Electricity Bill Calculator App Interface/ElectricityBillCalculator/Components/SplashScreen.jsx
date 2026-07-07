// src/screens/SplashScreen.js
import { useEffect, useRef } from "react";
import { View, Image, SafeAreaView, StatusBar } from "react-native";
import { useWindowDimensions } from "react-native";
import * as Animatable from "react-native-animatable";

import logo from "./assets/Logo.png";

export default function SplashScreen({ onAnimationComplete }) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  const textRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-primary-support">
      <StatusBar barStyle="light-content" backgroundColor="#468432" />

      {/* Main Container - Centers content horizontally and vertically */}
      <View className="flex-1 justify-center items-center px-6">
        {/* Logo + Text Group - Centered horizontally */}
        <View className="flex-row items-center justify-center gap-5 md:gap-8">
          {/* Logo - Larger size */}
          <Image
            source={logo}
            resizeMode="contain"
            style={{
              width: isSmallScreen ? 100 : 140,
              height: isSmallScreen ? 100 : 140,
            }}
          />

          {/* Text Container - Animated, White color, Larger size */}
          <Animatable.Text
            ref={textRef}
            animation="fadeInDown"
            duration={1000}
            easing="ease-out"
            iterationCount={1}
            className="text-white font-bold text-3xl md:text-5xl tracking-tight leading-tight max-w-[240px]"
          >
            Electricity{"\n"}Bill Calculator
          </Animatable.Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
