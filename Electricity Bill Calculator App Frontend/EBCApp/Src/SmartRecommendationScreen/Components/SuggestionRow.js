import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../../Theme/colors";
import { getRecommendationIcon } from "../Utils/getRecommendationIcon";

const SuggestionRow = ({ text, isLast = false }) => {
  const { icon, color } = getRecommendationIcon(text);

  return (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      {/* Left accent bar in the icon's color */}
      <View style={[styles.accent, { backgroundColor: color }]} />

      <View style={[styles.iconWrap, { backgroundColor: `${color}1A` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>

      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingLeft: 6,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  accent: {
    width: 3,
    height: 28,
    borderRadius: BORDER_RADIUS.sm,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.medium,
    lineHeight: 20,
  },
});

export default SuggestionRow;
