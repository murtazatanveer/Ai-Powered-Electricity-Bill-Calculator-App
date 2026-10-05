import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";

const EmptyState = ({
  icon = "file-tray-outline",
  title = "Nothing here yet",
  message = "",
}) => (
  <View style={styles.container}>
    <View style={styles.illustrationWrap}>
      {/* Outer soft halo */}
      <View style={styles.haloOuter} />

      {/* Middle ring */}
      <View style={styles.haloMiddle} />

      {/* Icon badge */}
      <View style={styles.iconBadge}>
        <Ionicons name={icon} size={38} color={COLORS.white} />
      </View>

      {/* Small decorative dots */}
      <View style={[styles.dot, styles.dotTopRight]} />
      <View style={[styles.dot, styles.dotBottomLeft]} />
      <View style={[styles.dot, styles.dotTopLeft]} />
    </View>

    <Text style={styles.title}>{title}</Text>
    {message ? <Text style={styles.message}>{message}</Text> : null}

    {/* Decorative divider */}
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <View style={styles.dividerDot} />
      <View style={styles.dividerLine} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },

  // ---------- Illustration ----------
  illustrationWrap: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.lg,
  },
  haloOuter: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.primaryFade,
    opacity: 0.4,
  },
  haloMiddle: {
    position: "absolute",
    width: 112,
    height: 112,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.primaryFade,
    opacity: 0.7,
  },
  iconBadge: {
    width: 78,
    height: 78,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.medium,
  },

  // ---------- Decorative dots ----------
  dot: {
    position: "absolute",
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.primary,
    opacity: 0.35,
  },
  dotTopRight: {
    width: 8,
    height: 8,
    top: 12,
    right: 20,
  },
  dotBottomLeft: {
    width: 10,
    height: 10,
    bottom: 22,
    left: 14,
  },
  dotTopLeft: {
    width: 6,
    height: 6,
    top: 34,
    left: 22,
    opacity: 0.25,
  },

  // ---------- Text ----------
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.xs,
    lineHeight: 20,
    maxWidth: 280,
  },

  // ---------- Divider ----------
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: SPACING.lg,
  },
  dividerLine: {
    width: 32,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerDot: {
    width: 5,
    height: 5,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.primary,
    opacity: 0.5,
  },
});

export default EmptyState;
