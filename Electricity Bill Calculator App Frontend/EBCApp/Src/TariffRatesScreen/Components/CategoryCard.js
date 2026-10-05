import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";
import TariffRow from "./TariffRow";

const CategoryCard = ({ categoryKey, colors, slabs }) => (
  <View style={styles.card}>
    {/* Colored header */}
    <View
      style={[
        styles.header,
        { backgroundColor: colors.tint, borderBottomColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.iconBadge,
          { backgroundColor: colors.accent, borderColor: colors.accent },
        ]}
      >
        <Ionicons name={colors.icon} size={16} color={COLORS.white} />
      </View>

      <Text style={[styles.headerLabel, { color: colors.accent }]}>
        {colors.label}
      </Text>

      <Text style={[styles.headerCount, { color: colors.accent }]}>
        {slabs.length} {slabs.length === 1 ? "slab" : "slabs"}
      </Text>
    </View>

    {/* Table header — matches row column widths */}
    <View style={styles.tableHeader}>
      <Text style={[styles.colLabel, styles.colSlab]}>SLAB</Text>
      <Text style={[styles.colLabel, styles.colFixed]}>FIXED</Text>
      <Text style={[styles.colLabel, styles.colRate]}>RATE / UNIT</Text>
    </View>

    {/* Rows */}
    <View style={styles.rowsWrap}>
      {slabs.map((slab, idx) => (
        <TariffRow
          key={`${slab.type}-${idx}`}
          slab={slab}
          accent={colors.accent}
          isLast={idx === slabs.length - 1}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    ...SHADOWS.medium,
  },

  // Colored header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  headerCount: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    opacity: 0.85,
  },

  // Table header — same column widths as row
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.backgroundGray,
  },
  colLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.6,
  },
  colSlab: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  colFixed: {
    width: 80,
    textAlign: "right",
    paddingRight: SPACING.sm,
  },
  colRate: {
    width: 90,
    textAlign: "right",
  },

  // Rows container — extra right padding so nothing can clip
  rowsWrap: {
    paddingHorizontal: SPACING.md,
    paddingRight: SPACING.md + 4,
  },
});

export default CategoryCard;
