import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../../Theme/colors";

const getStatusColor = (status) => {
  if (status === "Lifeline") return COLORS.success;
  if (status === "Protected") return COLORS.info;
  return COLORS.warning;
};

const StatusRiskBanner = ({
  currentStatus,
  nextStatus,
  nextThreshold,
  projectedMonthUnits,
}) => {
  const currentColor = getStatusColor(currentStatus);
  const nextColor = getStatusColor(nextStatus);

  // Progress: how close is the projected consumption to the threshold
  const threshold = Number(nextThreshold) || 0;
  const projected = Number(projectedMonthUnits) || 0;
  const ratio = threshold > 0 ? Math.min(projected / threshold, 1.5) : 0;
  const fillPercent = Math.min(ratio, 1) * 100;

  return (
    <View style={styles.banner}>
      {/* Row 1: transition arrow */}
      <View style={styles.headerRow}>
        <View style={styles.transitionRow}>
          <View
            style={[
              styles.chip,
              {
                backgroundColor: `${currentColor}1A`,
                borderColor: currentColor,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: currentColor }]}>
              {currentStatus}
            </Text>
          </View>

          <Ionicons name="arrow-forward" size={16} color={COLORS.textLight} />

          <View
            style={[
              styles.chip,
              { backgroundColor: `${nextColor}1A`, borderColor: nextColor },
            ]}
          >
            <Text style={[styles.chipText, { color: nextColor }]}>
              {nextStatus}
            </Text>
          </View>
        </View>
      </View>

      {/* Row 2: progress bar */}
      <View style={styles.progressRow}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${fillPercent}%`,
                backgroundColor: nextColor,
              },
            ]}
          />
        </View>
      </View>

      {/* Row 3: legend */}
      <View style={styles.legendRow}>
        <Text style={styles.legendText}>
          Projected:{" "}
          <Text style={styles.legendBold}>{Math.round(projected)}</Text> units
        </Text>
        <Text style={styles.legendText}>
          Threshold: <Text style={styles.legendBold}>{threshold}</Text> units
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#FFF9F0",
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: "#F5E0B8",
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  transitionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    flexWrap: "wrap",
  },
  chip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.circle,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  progressRow: {
    marginVertical: 2,
  },
  progressTrack: {
    height: 8,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: "#F5E0B8",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: BORDER_RADIUS.circle,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  legendBold: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

export default StatusRiskBanner;
