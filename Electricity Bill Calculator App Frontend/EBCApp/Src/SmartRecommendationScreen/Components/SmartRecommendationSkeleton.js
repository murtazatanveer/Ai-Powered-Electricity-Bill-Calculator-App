import { View, StyleSheet, ScrollView } from "react-native";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../../Theme/colors";
import SkeletonBlock from "../../Common/Components/SkeletonBlock";

const TileSkeleton = () => (
  <View style={styles.tile}>
    <View style={styles.tileTop}>
      <SkeletonBlock width={24} height={24} borderRadius={BORDER_RADIUS.sm} />
      <SkeletonBlock width="50%" height={10} />
    </View>
    <SkeletonBlock width="70%" height={22} style={{ marginTop: SPACING.xs }} />
    <SkeletonBlock width="50%" height={10} style={{ marginTop: SPACING.xxs }} />
  </View>
);

const SmartRecommendationSkeleton = () => (
  <ScrollView
    contentContainerStyle={styles.scrollContent}
    showsVerticalScrollIndicator={false}
  >
    {/* Header skeleton */}
    <View style={styles.headerRow}>
      <SkeletonBlock width={44} height={44} borderRadius={BORDER_RADIUS.md} />
      <View style={{ flex: 1 }}>
        <SkeletonBlock width="55%" height={22} />
        <SkeletonBlock
          width="70%"
          height={12}
          style={{ marginTop: SPACING.xs }}
        />
      </View>
    </View>

    {/* Hero card skeleton */}
    <View style={styles.card}>
      <SkeletonBlock width="90%" height={22} />
      <SkeletonBlock
        width="75%"
        height={22}
        style={{ marginTop: SPACING.xs }}
      />

      <View style={styles.suggestionsWrap}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.suggestionRow}>
            <SkeletonBlock
              width={32}
              height={32}
              borderRadius={BORDER_RADIUS.md}
            />
            <View style={{ flex: 1 }}>
              <SkeletonBlock width="90%" height={12} />
              <SkeletonBlock width="60%" height={12} style={{ marginTop: 4 }} />
            </View>
          </View>
        ))}
      </View>
    </View>

    {/* Stats grid skeleton */}
    <View style={styles.grid}>
      <View style={styles.gridRow}>
        <TileSkeleton />
        <TileSkeleton />
      </View>
      <View style={styles.gridRow}>
        <TileSkeleton />
        <TileSkeleton />
      </View>
    </View>

    {/* Risk banner skeleton */}
    <View style={styles.bannerSkeleton}>
      <SkeletonBlock width="60%" height={18} />
      <SkeletonBlock
        width="100%"
        height={8}
        borderRadius={BORDER_RADIUS.circle}
        style={{ marginTop: SPACING.sm }}
      />
      <SkeletonBlock
        width="50%"
        height={10}
        style={{ marginTop: SPACING.xs }}
      />
    </View>

    {/* Bill impact skeleton */}
    <View style={styles.impactSkeleton}>
      <SkeletonBlock width="70%" height={12} />
      <SkeletonBlock
        width="60%"
        height={12}
        style={{ marginTop: SPACING.sm }}
      />
      <SkeletonBlock
        width="40%"
        height={16}
        style={{ marginTop: SPACING.sm }}
      />
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
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  suggestionsWrap: {
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  grid: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  gridRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  tile: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  tileTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bannerSkeleton: {
    backgroundColor: "#FFF9F0",
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: "#F5E0B8",
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  impactSkeleton: {
    backgroundColor: "#FDECEA",
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: "#F5C6C2",
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
});

export default SmartRecommendationSkeleton;
