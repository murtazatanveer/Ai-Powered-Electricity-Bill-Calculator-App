import { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import COLORS from "../../Components/Colors";

const { width } = Dimensions.get("window");

export default function LoginSkeleton() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  const SkeletonBlock = ({ width: w, height: h, borderRadius = 8, style }) => (
    <View
      style={[
        {
          width: w,
          height: h,
          borderRadius,
          overflow: "hidden",
          backgroundColor: "#D0D9B8",
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          width: "100%",
          height: "100%",
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={["#D0D9B8", "#E8EED8", "#D0D9B8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: "100%", height: "100%" }}
        />
      </Animated.View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Logo Skeleton */}
      <View style={styles.logoContainer}>
        <SkeletonBlock width={110} height={110} borderRadius={20} />
        <View style={{ marginTop: 12 }}>
          <SkeletonBlock width={width * 0.45} height={30} borderRadius={8} />
        </View>
      </View>

      {/* Email Input Skeleton */}
      <View style={styles.inputSkeletonWrapper}>
        <SkeletonBlock width={width * 0.82} height={58} borderRadius={16} />
      </View>

      {/* Password Input Skeleton */}
      <View style={styles.inputSkeletonWrapper}>
        <SkeletonBlock width={width * 0.82} height={58} borderRadius={16} />
      </View>

      {/* Remember Me & Forgot Password Skeleton */}
      <View style={styles.rowSkeleton}>
        <SkeletonBlock width={120} height={20} borderRadius={4} />
        <SkeletonBlock width={100} height={20} borderRadius={4} />
      </View>

      {/* Login Button Skeleton */}
      <View style={styles.buttonWrapper}>
        <SkeletonBlock width={width * 0.82} height={56} borderRadius={16} />
      </View>

      {/* Footer Skeleton */}
      <View style={styles.footerSkeleton}>
        <SkeletonBlock width={140} height={18} borderRadius={4} />
        <SkeletonBlock
          width={80}
          height={18}
          borderRadius={4}
          style={{ marginLeft: 6 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: 80,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  inputSkeletonWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 16,
  },
  rowSkeleton: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 4,
    marginBottom: 24,
    marginTop: 4,
  },
  buttonWrapper: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  footerSkeleton: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
});
