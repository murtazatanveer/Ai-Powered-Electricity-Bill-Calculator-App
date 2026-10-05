import { View, StyleSheet } from "react-native";
import { COLORS } from "../../Theme/colors";

/**
 * Decorative corner circles used behind screen content.
 *
 * variant:
 *   "fade"  → soft primaryFade tint (default — used on form screens)
 *   "solid" → solid primary green (used on splash/brand screens)
 */
const ScreenBackground = ({ variant = "fade" }) => {
  const circleColor = variant === "solid" ? COLORS.primary : COLORS.primaryFade;

  return (
    <View pointerEvents="none" style={styles.decorations}>
      <View style={[styles.topRightCircle, { backgroundColor: circleColor }]} />
      <View
        style={[styles.bottomLeftCircle, { backgroundColor: circleColor }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  decorations: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  topRightCircle: {
    position: "absolute",
    top: -90,
    right: -90,
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  bottomLeftCircle: {
    position: "absolute",
    bottom: -110,
    left: -110,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
});

export default ScreenBackground;
