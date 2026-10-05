import { View, StyleSheet, ScrollView } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../../Theme/colors";
import SkeletonBlock from "../../Common/Components/SkeletonBlock";

const SingleReadingSkeleton = () => (
  <ScrollView
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
  >
    {/* Header skeleton */}
    <View style={styles.headerRow}>
      <SkeletonBlock width={40} height={40} borderRadius={BORDER_RADIUS.md} />
      <View style={{ flex: 1 }}>
        <SkeletonBlock width="55%" height={20} />
        <SkeletonBlock
          width="70%"
          height={12}
          style={{ marginTop: SPACING.xs }}
        />
      </View>
    </View>

    {/* Hero card skeleton */}
    <View style={styles.heroCard}>
      <View style={styles.heroTop}>
        <SkeletonBlock width="30%" height={14} />
        <SkeletonBlock
          width={90}
          height={22}
          borderRadius={BORDER_RADIUS.circle}
        />
      </View>
      <SkeletonBlock
        width="55%"
        height={40}
        style={{ marginVertical: SPACING.sm }}
      />
      <View style={styles.tagRow}>
        <SkeletonBlock
          width={100}
          height={26}
          borderRadius={BORDER_RADIUS.circle}
        />
        <SkeletonBlock
          width={120}
          height={26}
          borderRadius={BORDER_RADIUS.circle}
        />
      </View>
      <View style={styles.divider} />
      <SkeletonBlock width="50%" height={16} />
    </View>

    {/* Section skeleton — Slab breakdown */}
    <View style={styles.sectionCard}>
      <SkeletonBlock width="45%" height={18} />
      <View style={{ marginTop: SPACING.md, gap: SPACING.sm }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.row}>
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonBlock width="60%" height={12} />
              <SkeletonBlock width="80%" height={10} />
            </View>
            <SkeletonBlock width={60} height={14} />
          </View>
        ))}
      </View>
    </View>

    {/* Section skeleton — Bill breakdown */}
    <View style={styles.sectionCard}>
      <SkeletonBlock width="40%" height={18} />
      <View style={{ marginTop: SPACING.md, gap: SPACING.sm }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <View key={i} style={styles.row}>
            <SkeletonBlock width="50%" height={12} />
            <SkeletonBlock width={70} height={12} />
          </View>
        ))}
      </View>
    </View>
  </ScrollView>
);

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tagRow: {
    flexDirection: "row",
    gap: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginVertical: SPACING.md,
  },
  sectionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default SingleReadingSkeleton;
