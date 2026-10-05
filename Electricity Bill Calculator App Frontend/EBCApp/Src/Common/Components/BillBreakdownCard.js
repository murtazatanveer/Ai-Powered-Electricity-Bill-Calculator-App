import { View, Text, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "../../Theme/colors";
import { formatCurrency } from "../../ReadingsScreen/Utils/formatMonthYear";

// Order + labels for the billBreakDown object keys
const LINE_ITEMS = [
  { key: "costOfElectricity", label: "Cost of Electricity" },
  { key: "fixedCharges", label: "Fixed Charges" },
  { key: "electricityDuty", label: "Electricity Duty" },
  { key: "fcSurcharge", label: "FC Surcharge" },
  { key: "QTA", label: "QTA" },
  { key: "FPA", label: "FPA" },
  { key: "tvFee", label: "TV Fee" },
  { key: "GST", label: "GST" },
];

const BillBreakdownCard = ({ breakdown }) => {
  if (!breakdown) return null;

  return (
    <View>
      {LINE_ITEMS.map((item, idx) => {
        const value = breakdown[item.key];
        const isGST = item.key === "GST";
        return (
          <View
            key={item.key}
            style={[
              styles.row,
              idx < LINE_ITEMS.length - 1 && styles.rowDivider,
              isGST && styles.gstRow,
            ]}
          >
            <Text style={[styles.label, isGST && styles.gstLabel]}>
              {item.label}
            </Text>
            <Text style={[styles.value, isGST && styles.gstValue]}>
              {formatCurrency(value)}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

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
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  gstRow: {
    marginTop: SPACING.xs,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 0,
  },
  gstLabel: {
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  gstValue: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

export default BillBreakdownCard;
