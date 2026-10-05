import { View, StyleSheet, ScrollView } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../../Theme/colors";
import SkeletonBlock from "./SkeletonBlock";

const StatCardSkeleton = () => (
  <View style={styles.statCard}>
    <SkeletonBlock width={28} height={28} borderRadius={BORDER_RADIUS.md} />
    <SkeletonBlock width="70%" height={14} style={{ marginTop: SPACING.sm }} />
    <SkeletonBlock width="90%" height={10} style={{ marginTop: 6 }} />
  </View>
);

const DashboardSkeleton = () => (
  <ScrollView
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
  >
    {/* ---------- Header skeleton ---------- */}
    <View style={styles.headerRow}>
      <SkeletonBlock width={44} height={44} borderRadius={BORDER_RADIUS.md} />
      <View style={styles.headerText}>
        <SkeletonBlock width="55%" height={22} />
        <SkeletonBlock
          width="70%"
          height={12}
          style={{ marginTop: SPACING.xs }}
        />
      </View>
    </View>

    {/* ---------- Consumer info card skeleton ---------- */}
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <SkeletonBlock width="50%" height={22} />
        <SkeletonBlock
          width={90}
          height={22}
          borderRadius={BORDER_RADIUS.circle}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <SkeletonBlock width={32} height={32} borderRadius={BORDER_RADIUS.md} />
        <View style={{ flex: 1 }}>
          <SkeletonBlock width="40%" height={10} />
          <SkeletonBlock width="60%" height={14} style={{ marginTop: 4 }} />
        </View>
      </View>

      <View style={[styles.row, { marginTop: SPACING.sm }]}>
        <SkeletonBlock width={32} height={32} borderRadius={BORDER_RADIUS.md} />
        <View style={{ flex: 1 }}>
          <SkeletonBlock width="40%" height={10} />
          <SkeletonBlock width="60%" height={14} style={{ marginTop: 4 }} />
        </View>
      </View>
    </View>

    {/* ---------- Stat grid skeleton (2x2) ---------- */}
    <View style={styles.gridGap}>
      <View style={styles.gridRow}>
        <StatCardSkeleton />
        <StatCardSkeleton />
      </View>
      <View style={styles.gridRow}>
        <StatCardSkeleton />
        <StatCardSkeleton />
      </View>
    </View>

    {/* ---------- Billing history card skeleton ---------- */}
    <View style={styles.card}>
      <SkeletonBlock width="50%" height={20} />
      <SkeletonBlock
        width="65%"
        height={12}
        style={{ marginTop: SPACING.xs, marginBottom: SPACING.md }}
      />

      {/* Bill badge skeleton */}
      <View style={styles.billBadgeSkeleton}>
        <View style={styles.billBadgeLeft}>
          <SkeletonBlock
            width={34}
            height={34}
            borderRadius={BORDER_RADIUS.md}
          />
          <View style={{ flex: 1 }}>
            <SkeletonBlock width="50%" height={12} />
            <SkeletonBlock width="35%" height={10} style={{ marginTop: 4 }} />
          </View>
        </View>
        <SkeletonBlock width={80} height={22} />
      </View>

      {/* Chart skeleton — bars of varying heights */}
      <View style={styles.chartWrap}>
        {[
          0.3, 0.45, 0.25, 0.6, 0.5, 0.4, 0.65, 0.35, 0.55, 0.7, 0.4, 0.5, 0.35,
        ].map((ratio, i) => (
          <View key={i} style={styles.chartColumn}>
            <View
              style={[
                styles.chartBar,
                {
                  height: 30 + ratio * 90,
                  backgroundColor: COLORS.skeleton,
                },
              ]}
            />
            <SkeletonBlock
              width={22}
              height={8}
              style={{ marginTop: SPACING.xs }}
            />
          </View>
        ))}
      </View>
    </View>

    {/* ---------- Action buttons skeleton ---------- */}
    <SkeletonBlock
      height={52}
      borderRadius={BORDER_RADIUS.md}
      style={{ marginTop: SPACING.xs }}
    />
    <SkeletonBlock
      height={52}
      borderRadius={BORDER_RADIUS.md}
      style={{ marginTop: SPACING.sm }}
    />
  </ScrollView>
);

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },

  // ---------- Header ----------
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  headerText: {
    flex: 1,
  },

  // ---------- Generic card ----------
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },

  // ---------- Stats grid ----------
  gridGap: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  gridRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },

  // ---------- Bill badge skeleton ----------
  billBadgeSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryFade,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  billBadgeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flex: 1,
  },

  // ---------- Chart skeleton ----------
  chartWrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 140,
    gap: SPACING.xs,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chartBar: {
    width: "70%",
    borderTopLeftRadius: BORDER_RADIUS.sm,
    borderTopRightRadius: BORDER_RADIUS.sm,
  },
});

export default DashboardSkeleton;
