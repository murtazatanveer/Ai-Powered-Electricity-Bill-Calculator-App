import { View, StyleSheet, ScrollView } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../../Theme/colors";
import SkeletonBlock from "../../Common/Components/SkeletonBlock";

const RowSkeleton = () => (
  <View style={styles.row}>
    <SkeletonBlock width="40%" height={12} />
    <SkeletonBlock width={50} height={12} />
    <SkeletonBlock width={60} height={12} />
  </View>
);

const CategorySkeleton = ({ rows = 3 }) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <SkeletonBlock width={30} height={30} borderRadius={BORDER_RADIUS.md} />
      <SkeletonBlock width="40%" height={16} />
    </View>
    <View style={styles.rowsWrap}>
      {Array.from({ length: rows }).map((_, i) => (
        <RowSkeleton key={i} />
      ))}
    </View>
  </View>
);

const TariffRatesSkeleton = () => (
  <ScrollView
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
  >
    {/* Header skeleton */}
    <View style={styles.topHeader}>
      <SkeletonBlock width={46} height={46} borderRadius={BORDER_RADIUS.md} />
      <View style={{ flex: 1 }}>
        <SkeletonBlock width="55%" height={22} />
        <SkeletonBlock
          width="75%"
          height={12}
          style={{ marginTop: SPACING.xs }}
        />
      </View>
    </View>

    <CategorySkeleton rows={2} />
    <CategorySkeleton rows={2} />
    <CategorySkeleton rows={5} />
  </ScrollView>
);

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primaryFade,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    ...SHADOWS.medium,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.backgroundGray,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowsWrap: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    gap: SPACING.sm,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
  },
});

export default TariffRatesSkeleton;
