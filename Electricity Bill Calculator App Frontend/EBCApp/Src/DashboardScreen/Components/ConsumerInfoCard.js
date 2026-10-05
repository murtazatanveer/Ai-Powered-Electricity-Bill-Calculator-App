import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";
import { getConsumerDisplayName } from "../Utils/shortenConsumerName";

const getStatusMeta = (status) => {
  if (status === "Protected")
    return { color: COLORS.success, bg: "#E8F8EE", border: "#A8DCBB" };
  if (status === "Lifeline")
    return { color: COLORS.info, bg: "#E6F0FF", border: "#A8C6F5" };
  return { color: COLORS.warning, bg: "#FFF4E6", border: "#F5C99B" };
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.row}>
    <View style={styles.rowIcon}>
      <Ionicons name={icon} size={16} color={COLORS.primary} />
    </View>
    <View style={styles.rowBody}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  </View>
);

const ConsumerInfoCard = ({ data }) => {
  const meta = getStatusMeta(data.status);
  const displayName = getConsumerDisplayName(data.consumerName);

  return (
    <View style={styles.card}>
      {/* Top row: name + status */}
      <View style={styles.headerRow}>
        <Text style={styles.consumerName} numberOfLines={1}>
          {displayName}
        </Text>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: meta.bg, borderColor: meta.border },
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
          <Text style={[styles.statusText, { color: meta.color }]}>
            {data.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metaGrid}>
        <InfoRow icon="business-outline" label="DISCO" value={data.disco} />
        <InfoRow
          icon="flash-outline"
          label="Meter Phase"
          value={data.meterPhase}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  consumerName: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.circle,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: BORDER_RADIUS.circle,
  },
  statusText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  metaGrid: {
    gap: SPACING.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryFade,
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  rowValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginTop: 1,
  },
});

export default ConsumerInfoCard;
