import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";

const ScreenHeader = ({
  title,
  subtitle,
  actionIcon,
  actionLabel,
  onAction,
  onMenuPress,
}) => (
  <View style={styles.container}>
    <View style={styles.row}>
      {/* ---------- Hamburger ---------- */}
      {onMenuPress ? (
        <TouchableOpacity
          onPress={onMenuPress}
          activeOpacity={0.75}
          style={styles.menuButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      ) : null}

      {/* ---------- Title + subtitle ---------- */}
      <View style={styles.textWrap}>
        <View style={styles.titleRow}>
          <View style={styles.titleAccent} />
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {/* ---------- Optional action button ---------- */}
      {actionIcon ? (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.85}
          style={styles.actionButton}
        >
          <Ionicons name={actionIcon} size={18} color={COLORS.white} />
          {actionLabel ? (
            <Text style={styles.actionLabel}>{actionLabel}</Text>
          ) : null}
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primaryFade,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },

  // ---------- Hamburger ----------
  menuButton: {
    width: 46,
    height: 46,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.small,
  },

  // ---------- Title block ----------
  textWrap: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  titleAccent: {
    width: 4,
    height: 22,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginLeft: 4 + SPACING.xs,
  },

  // ---------- Action button ----------
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    height: 46,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  actionLabel: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.2,
  },
});

export default ScreenHeader;
