import { View, StyleSheet } from "react-native";
import { SPACING, COLORS } from "../../Theme/colors";
import StatCard from "../../Common/Components/StatCard";
import { formatCurrency } from "../../ReadingsScreen/Utils/formatMonthYear";
import useCountUp from "../../Common/Hooks/useCountUp";

const QuickStatGrid = ({ data }) => {
  const currentBill = data.billingHistory?.[0]?.bill ?? 0;
  const runningUnits = data.monthlyRunningUnits ?? 0;
  const readingDate = data.readingDate ?? 0;
  const historyCount = data.billingHistory?.length ?? 0;

  // Animated counter — runs on mount
  const animatedBill = useCountUp(currentBill, 2400);
  const animatedUnits = useCountUp(runningUnits, 2400);

  return (
    <View style={styles.grid}>
      <View style={styles.row}>
        <StatCard
          icon="cash-outline"
          value={formatCurrency(animatedBill)}
          label="Current month bill"
          accent={COLORS.primary}
        />
        <StatCard
          icon="speedometer-outline"
          value={animatedUnits}
          unit="kWh"
          label="Monthly running units"
          accent={COLORS.info}
        />
      </View>
      <View style={styles.row}>
        <StatCard
          icon="calendar-outline"
          value={`${readingDate}`}
          unit="of month"
          label="Next reading date"
          accent={COLORS.warning}
        />
        <StatCard
          icon="pulse-outline"
          value={historyCount}
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
