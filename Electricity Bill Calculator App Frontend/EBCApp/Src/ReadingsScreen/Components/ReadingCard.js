import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../../Theme/colors";
import { formatReadingDate, formatCurrency } from "../Utils/formatMonthYear";
import useCountUp from "../../Common/Hooks/useCountUp";

const getStatusMeta = (status) => {
  if (status === "Protected")
    return {
      icon: "shield-checkmark-outline",
      color: COLORS.success,
      bg: "#E8F8EE",
      border: "#A8DCBB",
    };
  if (status === "Lifeline")
    return {
      icon: "flash-outline",
      color: COLORS.info,
      bg: "#E6F0FF",
      border: "#A8C6F5",
    };
  return {
    icon: "alert-circle-outline",
    color: COLORS.warning,
    bg: "#FFF4E6",
    border: "#F5C99B",
  };
};

const ReadingCard = ({ reading, onPress, onDelete, isLast = false }) => {
  const meta = getStatusMeta(reading.status);

  // Animated numbers — run on mount, restart if the reading's values change
  const animatedUnits = useCountUp(reading.consumedUnits ?? 0, 2400);
  const animatedBill = useCountUp(reading.totalBill ?? 0, 2400);

  return (
    <TouchableOpacity
      style={[styles.card, isLast && styles.cardLast]}
      activeOpacity={0.85}
      onPress={() => onPress?.(reading)}
    >
      {/* Colored left border, driven by status */}
      <View style={[styles.leftBorder, { backgroundColor: meta.color }]} />

      {/* ---------- Middle: date, units, status ---------- */}
      <View style={styles.middle}>
        <Text style={styles.date}>{formatReadingDate(reading.createdAt)}</Text>

        <Text style={styles.units}>
          {animatedUnits} <Text style={styles.unitsUnit}>kWh</Text>
        </Text>

        <View
          style={[
            styles.statusPill,
            { backgroundColor: meta.bg, borderColor: meta.border },
          ]}
        >
          <Ionicons name={meta.icon} size={12} color={meta.color} />
          <Text style={[styles.statusText, { color: meta.color }]}>
            {reading.status}
          </Text>
        </View>
      </View>

      {/* ---------- Right: bill badge ---------- */}
      <View style={styles.billBadge}>
        <View style={styles.billBadgeTop}>
          <Ionicons name="receipt-outline" size={12} color={COLORS.primary} />
          <Text style={styles.billBadgeLabel}>BILL</Text>
        </View>
        <Text style={styles.billBadgeValue}>
          {formatCurrency(animatedBill)}
        </Text>
      </View>

      {/* ---------- Delete button ---------- */}
      <TouchableOpacity
        onPress={() => onDelete?.(reading)}
        activeOpacity={0.7}
        style={styles.deleteButton}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Delete reading"
      >
        <Ionicons name="trash-outline" size={16} color={COLORS.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.md,
    paddingRight: SPACING.md,
    paddingLeft: SPACING.md + 4,
    marginBottom: SPACING.xs,
    gap: SPACING.sm,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardLast: {
    marginBottom: 0,
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

  // ---------- Middle column ----------
  middle: {
    flex: 1,
    gap: 4,
    alignItems: "flex-start",
  },
  date: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  units: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    fontVariant: ["tabular-nums"],
  },
  unitsUnit: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.circle,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // ---------- Bill badge ----------
  billBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryFade,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 90,
  },
  billBadgeTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginBottom: 2,
  },
  billBadgeLabel: {
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    letterSpacing: 0.6,
  },
  billBadgeValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    letterSpacing: -0.2,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },

  // ---------- Delete button ----------
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "#FDECEA",
    borderWidth: 1,
    borderColor: "#F5C6C2",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ReadingCard;
