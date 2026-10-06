import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";
import useCountUp from "../../Common/Hooks/useCountUp";

// Single uniform background shade for every tile, tuned to sit between
// the pale primaryFade and the deep primary — richer than the page bg,
// softer than the brand green.
const TILE_BG = "#D6EBDF";
const TILE_BORDER = "#A8D5BA";

const StatTile = ({
  icon,
  value,
  unit,
  label,
  caption,
  accent = COLORS.primary,
  highlight = false,
}) => {
  const isNumeric = typeof value === "number" && Number.isFinite(value);
  const animatedValue = useCountUp(isNumeric ? value : 0, 2400);
  const displayValue = isNumeric ? animatedValue : value;

  return (
    <View
      style={[
        styles.tile,
        highlight && { borderWidth: 2, borderColor: accent },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}1A` }]}>
          <Ionicons name={icon} size={14} color={accent} />
        </View>
        <Text style={[styles.label, { color: accent }]} numberOfLines={2}>
          {label}
        </Text>
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.value} numberOfLines={1}>
          {displayValue}
        </Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>

      {caption ? (
        <View style={styles.captionWrap}>
          <Text style={styles.caption} numberOfLines={1}>
            {caption}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: TILE_BG,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderWidth: 1,
    borderColor: TILE_BORDER,
    gap: 6,
    ...SHADOWS.small,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
    fontVariant: ["tabular-nums"],
  },
  unit: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
  },

  // ---------- Caption (was too faint) ----------
  captionWrap: {
    marginTop: 2,
  },
  caption: {
    fontSize: TYPOGRAPHY.sizes.xs, // 11pt (was 10pt)
    fontWeight: TYPOGRAPHY.weights.semibold, // was "medium"
    color: COLORS.primaryDark, // deeper green — high contrast on the tile
    letterSpacing: 0.2,
  },
});

export default StatTile;
