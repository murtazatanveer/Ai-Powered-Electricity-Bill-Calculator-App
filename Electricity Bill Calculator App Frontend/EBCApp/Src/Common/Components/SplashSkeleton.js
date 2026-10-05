import { View, StyleSheet } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS } from "../../Theme/colors";
import SkeletonBlock from "./SkeletonBlock";

const SplashSkeleton = () => (
  <View style={styles.container}>
    {/* Decorative brand circles — same as SplashScreen */}
    <View style={styles.topRightCircle} />
    <View style={styles.bottomLeftCircle} />

    {/* Centered logo + name + subtitle placeholders */}
    <View style={styles.centerContent}>
      {/* Logo placeholder — 140×140 to match the real SplashScreen */}
      <SkeletonBlock width={140} height={140} borderRadius={BORDER_RADIUS.xl} />

      {/* App name placeholder */}
      <SkeletonBlock
        width={200}
        height={34}
        borderRadius={BORDER_RADIUS.md}
        style={{ marginTop: SPACING.md }}
      />

      {/* Subtitle placeholder */}
      <SkeletonBlock
        width={140}
        height={14}
        borderRadius={BORDER_RADIUS.sm}
        style={{ marginTop: SPACING.sm }}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  topRightCircle: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.primary,
  },
  bottomLeftCircle: {
    position: "absolute",
    bottom: -60,
    left: -60,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: COLORS.primary,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    paddingHorizontal: SPACING.xl,
  },
});

export default SplashSkeleton;
