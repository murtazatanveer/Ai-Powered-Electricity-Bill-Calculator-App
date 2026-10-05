import { View, StyleSheet } from "react-native";
import { SPACING, COLORS } from "../../Theme/colors";
import StatCard from "../../ReadingsScreen/Components/StatCard";
import { formatCurrency } from "../../ReadingsScreen/Utils/formatMonthYear";

const QuickStatGrid = ({ data }) => {
  const currentBill = data.billingHistory?.[0]?.bill ?? 0;

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <StatCard
          icon="cash-outline"
          value={formatCurrency(currentBill)}
          label="Current month bill"
          accent={COLORS.primary}
        />
        <StatCard
          icon="speedometer-outline"
          value={data.monthlyRunningUnits}
          unit="kWh"
          label="Present reading"
          accent={COLORS.info}
        />
      </View>
      <View style={styles.row}>
        <StatCard
          icon="calendar-outline"
          value={`${data.readingDate}`}
          unit="of month"
          label="Next reading date"
          accent={COLORS.warning}
        />
        <StatCard
          icon="pulse-outline"
          value={data.billingHistory?.length || 0}
          unit="months"
          label="Billing history"
          accent={COLORS.success}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
});

export default QuickStatGrid;
