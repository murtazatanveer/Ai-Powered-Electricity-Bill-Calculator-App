import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../../Theme/colors";

/**
 * Parses a headline string like:
 *   "At your current pace you'll consume ~238 units that's 15% below your 281-unit average."
 * Into:
 *   { leadIn: "At your current pace", keyNumber: "238",
 *     comparison: "15% below your 281-unit average", tilt: "below" }
 *
 * Falls back to plain bold text when the structure doesn't match.
 */
const parseHeadline = (headline = "") => {
  // Find a number, optionally prefixed by "~" and optionally followed by "units"
  const numberMatch = headline.match(/~?(\d[\d,]*)\s*(units)?/i);
  // Find a percentage comparison clause
  const percentMatch = headline.match(
    /(\d+(?:\.\d+)?)\s*%\s*(above|below|higher|lower)/i,
  );

  if (!numberMatch) {
    return { leadIn: "", keyNumber: "", comparison: headline, tilt: null };
  }

  // Key number — number only, no unit suffix
  const rawNumber = numberMatch[1];

  // Everything before the number, cleaned of trailing filler
  const leadIn = headline
    .slice(0, numberMatch.index)
    .replace(/you'?ll consume\s*$/i, "")
    .replace(/,\s*$/, "")
    .trim();

  // Everything after the number+optional-unit, cleaned of leading filler
  const afterNumber = headline.slice(numberMatch.index + numberMatch[0].length);
  const comparison = afterNumber
    .replace(/^[,\s]*that'?s\s*/i, "")
    .replace(/^[,\s]+/, "")
    .replace(/^units\s+/i, "")
    .trim();

  return {
    leadIn: leadIn || "At your current pace",
    keyNumber: rawNumber,
    comparison: comparison || "",
    tilt: percentMatch ? percentMatch[2].toLowerCase() : null,
  };
};

const RecommendationHeadline = ({ headline }) => {
  const parsed = parseHeadline(headline);

  // Fallback — no number found, render as plain bold text
  if (!parsed.keyNumber) {
    return <Text style={styles.plain}>{headline}</Text>;
  }

  const isBad = parsed.tilt === "above" || parsed.tilt === "higher";

  return (
    <View style={styles.wrap}>
      {/* Lead-in label */}
      {parsed.leadIn ? (
        <Text style={styles.leadIn}>{parsed.leadIn}</Text>
      ) : null}

      {/* Big key number + unit suffix */}
      <Text style={styles.keyNumber}>
        {parsed.keyNumber}
        <Text style={styles.keyNumberUnit}> units</Text>
      </Text>

      {/* Comparison clause */}
      {parsed.comparison ? (
        <View
          style={[
            styles.comparisonWrap,
            isBad ? styles.comparisonWrapBad : styles.comparisonWrapGood,
          ]}
        >
          <Text
            style={[
              styles.comparison,
              isBad ? styles.comparisonBad : styles.comparisonGood,
            ]}
          >
            {parsed.comparison}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: SPACING.sm,
  },
  plain: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  leadIn: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  keyNumber: {
    fontSize: 34,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.primary,
    letterSpacing: -1,
    lineHeight: 38,
    fontVariant: ["tabular-nums"],
  },
  keyNumberUnit: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
    letterSpacing: 0,
  },
  comparisonWrap: {
    alignSelf: "flex-start",
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  comparisonWrapGood: {
    backgroundColor: COLORS.primaryFade,
  },
  comparisonWrapBad: {
    backgroundColor: "#FDECEA",
  },
  comparison: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    lineHeight: 18,
  },
  comparisonGood: {
    color: COLORS.primary,
  },
  comparisonBad: {
    color: COLORS.error,
  },
});

export default RecommendationHeadline;
