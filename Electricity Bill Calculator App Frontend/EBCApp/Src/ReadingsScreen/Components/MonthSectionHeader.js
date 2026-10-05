import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../../Theme/colors";

const MonthSectionHeader = ({ label, count }) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.pill}>
      <Text style={styles.pillText}>{count}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  pill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.primaryFade,
  },
  pillText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
});

export default MonthSectionHeader;
