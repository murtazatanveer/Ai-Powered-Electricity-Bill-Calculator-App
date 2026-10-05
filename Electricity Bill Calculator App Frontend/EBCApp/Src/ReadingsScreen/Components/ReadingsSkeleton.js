import { View, StyleSheet, ScrollView } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../../Theme/colors";
import SkeletonBlock from "../../Common/Components/SkeletonBlock";

const StatCardSkeleton = () => (
  <View style={styles.statCard}>
    <SkeletonBlock width={28} height={28} borderRadius={BORDER_RADIUS.md} />
    <SkeletonBlock width="70%" height={14} style={{ marginTop: SPACING.sm }} />
    <SkeletonBlock width="90%" height={10} style={{ marginTop: 6 }} />
  </View>
);

const ReadingCardSkeleton = () => (
  <View style={styles.readingCard}>
    <SkeletonBlock width={44} height={44} borderRadius={BORDER_RADIUS.md} />
    <View style={{ flex: 1, gap: 6 }}>
      <SkeletonBlock width="40%" height={10} />
      <SkeletonBlock width="70%" height={16} />
      <SkeletonBlock width="50%" height={12} />
    </View>
    <View style={{ alignItems: "flex-end", gap: 6 }}>
      <SkeletonBlock width={60} height={10} />
      <SkeletonBlock width={70} height={16} />
    </View>
  </View>
);

const MonthSectionSkeleton = ({ cards = 2 }) => (
  <View style={styles.sectionCard}>
    {/* Section header skeleton */}
    <View style={styles.sectionHeader}>
      <SkeletonBlock width="50%" height={20} />
      <SkeletonBlock
        width={26}
        height={20}
        borderRadius={BORDER_RADIUS.circle}
      />
    </View>

    {/* Reading cards */}
    <View style={styles.sectionBody}>
      {Array.from({ length: cards }).map((_, i) => (
        <ReadingCardSkeleton key={i} />
      ))}
    </View>
  </View>
);

const ReadingsSkeleton = () => (
  <ScrollView
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
  >
    {/* ---------- Header skeleton ---------- */}
    <View style={styles.headerCard}>
      <SkeletonBlock width={46} height={46} borderRadius={BORDER_RADIUS.md} />
      <View style={{ flex: 1 }}>
        <SkeletonBlock width="55%" height={24} />
        <SkeletonBlock
          width="75%"
          height={12}
          style={{ marginTop: SPACING.xs }}
        />
      </View>
      <SkeletonBlock
        width={80}
        height={46}
        borderRadius={BORDER_RADIUS.circle}
      />
    </View>

    {/* ---------- Stats row skeleton ---------- */}
    <View style={styles.statsRow}>
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </View>

    {/* ---------- Filter row skeleton ---------- */}
    <SkeletonBlock
      width={110}
      height={38}
      borderRadius={BORDER_RADIUS.circle}
      style={{ marginBottom: SPACING.md }}
    />

    {/* ---------- Section skeletons ---------- */}
    <MonthSectionSkeleton cards={2} />
    <MonthSectionSkeleton cards={2} />
  </ScrollView>
);

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },

  // Header card
  headerCard: {
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

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
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

  // Section
  sectionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: SPACING.sm,
  },
  sectionBody: {
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },

  // Reading card
  readingCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

export default ReadingsSkeleton;
