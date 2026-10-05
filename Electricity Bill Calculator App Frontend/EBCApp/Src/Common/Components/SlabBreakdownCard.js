import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../../Theme/colors";
import {
  formatCurrency,
  formatRate,
  slabLabel,
} from "../../ReadingsScreen/Utils/formatMonthYear";

const SlabBreakdownCard = ({ slabs }) => (
  <View>
    {slabs.map((slab, idx) => (
      <View
        key={slab.slabType || idx}
        style={[styles.row, idx < slabs.length - 1 && styles.rowDivider]}
      >
        <View style={styles.left}>
          <Text style={styles.slabName}>{slabLabel(slab.slabType)}</Text>
          <Text style={styles.slabMeta}>
            {slab.units} kWh × Rs {formatRate(slab.ratePerUnit)}
          </Text>
        </View>
        <Text style={styles.cost}>{formatCurrency(slab.cost)}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: {
    flex: 1,
  },
  slabName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  slabMeta: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cost: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginLeft: SPACING.md,
  },
});

export default SlabBreakdownCard;
