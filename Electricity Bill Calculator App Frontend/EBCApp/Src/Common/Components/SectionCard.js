import { View, Text, StyleSheet } from "react-native";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";

const SectionCard = ({ title, rightAccessory, children, style }) => (
  <View style={[styles.card, style]}>
    {title ? (
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {rightAccessory ? (
          <View style={styles.accessoryWrap}>{rightAccessory}</View>
        ) : null}
      </View>
    ) : null}
    <View style={styles.body}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  accessoryWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  body: {},
});

export default SectionCard;
