import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";
import {
  formatCurrency,
  formatReadingDate,
} from "../../ReadingsScreen/Utils/formatMonthYear";
import { getStatusUpdatedMeta } from "../Utils/formatStatusUpdated";

const getStatusMeta = (status) => {
  if (status === "Protected")
    return { color: COLORS.success, bg: "#E8F8EE", border: "#A8DCBB" };
  if (status === "Lifeline")
    return { color: COLORS.info, bg: "#E6F0FF", border: "#A8C6F5" };
  return { color: COLORS.warning, bg: "#FFF4E6", border: "#F5C99B" };
};

const MetaTag = ({ icon, text }) => (
  <View style={styles.tag}>
    <Ionicons name={icon} size={13} color={COLORS.white} />
    <Text style={styles.tagText}>{text}</Text>
  </View>
);

const ReadingStatusCard = ({ reading }) => {
  const meta = getStatusMeta(reading.status);
  const updatedMeta = getStatusUpdatedMeta(reading.statusUpdated, COLORS);

  const updatedValue = reading.statusUpdated === true ? "Yes" : "No";
  const updatedValueColor =
    reading.statusUpdated === true ? COLORS.white : "rgba(255, 255, 255, 0.7)";

  return (
    <View style={styles.card}>
      {/* Top row: label + status pill */}
      <View style={styles.topRow}>
        <Text style={styles.label}>Total Bill</Text>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: meta.bg, borderColor: meta.border },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
          <Text style={[styles.statusText, { color: meta.color }]}>
            {reading.status}
          </Text>
        </View>
      </View>

      {/* Total */}
      <Text style={styles.total}>{formatCurrency(reading.totalBill)}</Text>

      {/* Meta tags */}
      <View style={styles.metaRow}>
        <MetaTag icon="flash-outline" text={`${reading.consumedUnits} kWh`} />
        <MetaTag
          icon="calendar-outline"
          text={formatReadingDate(reading.createdAt)}
        />
      </View>

      {/* Divider + statusUpdated row */}
      <View style={styles.divider} />

      <View style={styles.updatedRow}>
        <View style={styles.updatedLeft}>
          <View style={styles.updatedIconWrap}>
            <Ionicons name={updatedMeta.icon} size={13} color={COLORS.white} />
          </View>
          <Text style={styles.updatedLabel}>Status auto-updated</Text>
        </View>
        <Text style={[styles.updatedValue, { color: updatedValueColor }]}>
          {updatedValue}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.white,
    opacity: 0.85,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.circle,
    borderWidth: 1.5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: BORDER_RADIUS.circle,
  },
  statusText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  total: {
    fontSize: 40,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    marginVertical: SPACING.sm,
    letterSpacing: -1,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
  tagText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: SPACING.md,
  },

  // ---------- statusUpdated row ----------
  updatedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  updatedLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  updatedIconWrap: {
    width: 26,
    height: 26,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  updatedLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.white,
    opacity: 0.9,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  updatedValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.2,
  },
});

export default ReadingStatusCard;
