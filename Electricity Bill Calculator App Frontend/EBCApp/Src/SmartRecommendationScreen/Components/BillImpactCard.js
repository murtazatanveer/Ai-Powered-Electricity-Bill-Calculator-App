import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../../Theme/colors";
import { formatCurrency } from "../../ReadingsScreen/Utils/formatMonthYear";

const Row = ({ label, value, isBold = false, isLast = false, valueColor }) => (
  <View style={[styles.row, !isLast && styles.rowDivider]}>
    <Text style={[styles.rowLabel, isBold && styles.rowLabelBold]}>
      {label}
    </Text>
    <Text
      style={[
        styles.rowValue,
        isBold && styles.rowValueBold,
        valueColor && { color: valueColor },
      ]}
    >
      {value}
    </Text>
  </View>
);

const BillImpactCard = ({
  currentBillAtCurrentStatus,
  projectedBillAtNextStatus,
  difference,
}) => (
  <View style={styles.card}>
    <Row
      label="Stay at current status"
      value={formatCurrency(currentBillAtCurrentStatus)}
    />
    <Row
      label="Move to next status"
      value={formatCurrency(projectedBillAtNextStatus)}
    />
    <Row
      label="Extra cost"
      value={`+ ${formatCurrency(difference)}`}
      isBold
      valueColor={COLORS.error}
      isLast
    />
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FDECEA",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: "#F5C6C2",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.xs,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F5C6C2",
  },
  rowLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  rowLabelBold: {
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  rowValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  rowValueBold: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

export default BillImpactCard;
