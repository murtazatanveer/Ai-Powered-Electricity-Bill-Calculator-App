import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";

const RecommendationBadge = ({ label = "Your Recommendation" }) => (
  <View style={styles.wrap}>
    {/* Soft glow ring behind the badge */}
    <View style={styles.glow} />

    <View style={styles.badge}>
      <View style={styles.iconCircle}>
        <Ionicons name="bulb" size={13} color={COLORS.primary} />
      </View>
      <Text style={styles.text}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    alignSelf: "flex-start",
    marginBottom: SPACING.md,
  },
  glow: {
    position: "absolute",
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.primaryFade,
    opacity: 0.8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 6,
    paddingRight: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
});

export default RecommendationBadge;
