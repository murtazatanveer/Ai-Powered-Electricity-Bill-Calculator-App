import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "../../Theme/colors";
import { formatCurrency } from "../../ReadingsScreen/Utils/formatMonthYear";
import { formatSlabLabel } from "../Utils/formatSlabLabel";

const TariffRow = ({ slab, accent, isLast = false }) => (
  <View style={[styles.row, !isLast && styles.rowDivider]}>
    <Text style={styles.cell1} numberOfLines={1}>
      {formatSlabLabel(slab.type)}
    </Text>
    <Text style={styles.cell2} numberOfLines={1}>
      {formatCurrency(slab.fixedCharges)}
    </Text>
    <Text style={[styles.cell3, { color: accent }]} numberOfLines={1}>
      {formatCurrency(slab.applicableCharges)}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  // Percentage widths — deterministic, no flex math
  cell1: {
    width: "50%",
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.medium,
    paddingRight: 8,
  },
  cell2: {
    width: "25%",
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textAlign: "right",
    paddingRight: 8,
  },
  cell3: {
    width: "25%",
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    textAlign: "right",
  },
});

export default TariffRow;
