import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../../Theme/colors";

const BAR_AREA_HEIGHT = 160;
const MIN_BAR_HEIGHT = 8;

const UnitsBarChart = ({ data, selectedIndex, onSelect }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No billing history yet.</Text>
      </View>
    );
  }

  // Chronological (oldest → newest) so newest sits on the right
  const ordered = [...data].reverse();
  const reverseIndexMap = ordered.map((_, idx) => ordered.length - 1 - idx);
  // reverseIndexMap[i] = the original index of the item displayed at position i

  const maxUnits = Math.max(...ordered.map((d) => d.units || 0), 1);

  return (
    <View>
      {/* Y-axis caption */}
      <View style={styles.axisRow}>
        <Text style={styles.axisLabel}>Units (kWh)</Text>
        <View style={styles.axisLine} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ordered.map((item, position) => {
          const originalIndex = reverseIndexMap[position];
          const isSelected = originalIndex === selectedIndex;
          const ratio = (item.units || 0) / maxUnits;
          const barHeight = Math.max(ratio * BAR_AREA_HEIGHT, MIN_BAR_HEIGHT);

          return (
            <TouchableOpacity
              key={`${item.month}-${originalIndex}`}
              activeOpacity={0.85}
              onPress={() => onSelect?.(originalIndex)}
              style={styles.barColumn}
            >
              {/* Value label */}
              <Text
                style={[
                  styles.valueLabel,
                  isSelected && styles.valueLabelSelected,
                ]}
              >
                {item.units}
              </Text>

              {/* Bar */}
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    { height: barHeight },
                    isSelected ? styles.barSelected : styles.barDefault,
                  ]}
                />
              </View>

              {/* Month label */}
              <Text
                style={[
                  styles.monthLabel,
                  isSelected && styles.monthLabelSelected,
                ]}
                numberOfLines={1}
              >
                {item.month.split(" ")[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  axisRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  axisLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  axisLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  scrollContent: {
    paddingRight: SPACING.md,
    gap: SPACING.sm,
    alignItems: "flex-end",
  },

  barColumn: {
    width: 44,
    alignItems: "center",
  },

  // ---------- Value label ----------
  valueLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  valueLabelSelected: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  // ---------- Bar track ----------
  barTrack: {
    height: BAR_AREA_HEIGHT,
    width: 26,
    justifyContent: "flex-end",
    alignItems: "center",
  },

  bar: {
    width: "100%",
    borderTopLeftRadius: BORDER_RADIUS.sm,
    borderTopRightRadius: BORDER_RADIUS.sm,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },

  barDefault: {
    backgroundColor: COLORS.secondaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    borderBottomWidth: 0,
  },
  barSelected: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  // ---------- Month label ----------
  monthLabel: {
    marginTop: SPACING.xs,
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  monthLabelSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  // ---------- Empty state ----------
  empty: {
    paddingVertical: SPACING.xxl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
});

export default UnitsBarChart;
