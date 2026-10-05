import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../../Theme/colors";
import useCountUp from "../../Common/Hooks/useCountUp";

const MonthSectionHeader = ({ label, count }) => {
  const animatedCount = useCountUp(count ?? 0, 2400);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.accent} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.pill}>
        <Text style={styles.pillText}>{animatedCount}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: SPACING.sm,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  accent: {
    width: 4,
    height: 18,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.primary,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  pill: {
    minWidth: 26,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.primaryFade,
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    fontVariant: ["tabular-nums"],
  },
});

export default MonthSectionHeader;
