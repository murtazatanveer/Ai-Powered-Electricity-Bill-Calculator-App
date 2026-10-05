import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";
import { formatReadingDate, formatCurrency } from "../Utils/formatMonthYear";

const getStatusMeta = (status) => {
  if (status === "Protected")
    return {
      icon: "shield-checkmark-outline",
      color: COLORS.success,
      bg: "#E8F8EE",
    };
  if (status === "Lifeline")
    return {
      icon: "flash-outline",
      color: COLORS.info,
      bg: "#E6F0FF",
    };
  return {
    icon: "alert-circle-outline",
    color: COLORS.warning,
    bg: "#FFF4E6",
  };
};

const ReadingCard = ({ reading, onPress }) => {
  const meta = getStatusMeta(reading.status);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => onPress?.(reading)}
    >
      {/* Colored left border, driven by status */}
      <View style={[styles.leftBorder, { backgroundColor: meta.color }]} />

      <View style={styles.iconWrap}>
        <Ionicons name="speedometer-outline" size={22} color={COLORS.primary} />
      </View>

      <View style={styles.middle}>
        <Text style={styles.date}>{formatReadingDate(reading.createdAt)}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.units}>
            {reading.consumedUnits} <Text style={styles.unitsUnit}>kWh</Text>
          </Text>
          <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
            <Ionicons name={meta.icon} size={12} color={meta.color} />
            <Text style={[styles.statusText, { color: meta.color }]}>
              {reading.status}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.billLabel}>Bill</Text>
        <Text style={styles.billValue}>
          {formatCurrency(reading.totalBill)}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={COLORS.textLight}
          style={styles.chevron}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    paddingLeft: SPACING.md + 6,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
    overflow: "hidden",
    ...SHADOWS.small,
  },
  leftBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: BORDER_RADIUS.lg,
    borderBottomLeftRadius: BORDER_RADIUS.lg,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryFade,
    alignItems: "center",
    justifyContent: "center",
  },
  middle: {
    flex: 1,
    gap: 4,
  },
  date: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    flexWrap: "wrap",
  },
  units: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  unitsUnit: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.circle,
  },
  statusText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  right: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  billLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  billValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginTop: 2,
  },
  chevron: {
    marginTop: 4,
  },
});

export default ReadingCard;
