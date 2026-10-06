import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../Theme/colors";

import ScreenHeader from "../Common/Components/ScreenHeader";
import ScreenBackground from "../Common/Components/ScreenBackground";
import SectionCard from "../Common/Components/SectionCard";
import EmptyState from "../Common/Components/EmptyState";
import ErrorPopup from "../Common/Components/ErrorPopup";
import SmartRecommendationSkeleton from "./Components/SmartRecommendationSkeleton";

import RecommendationBadge from "./Components/RecommendationBadge";
import RecommendationHeadline from "./Components/RecommendationHeadline";
import SuggestionRow from "./Components/SuggestionRow";
import StatTile from "./Components/StatTile";
import StatusRiskBanner from "./Components/StatusRiskBanner";
import BillImpactCard from "./Components/BillImpactCard";

import apiClient from "../Config/apiClient";
import { API_ENDPOINTS } from "../Config/ApiEndpoint";

const SmartRecommendationScreen = ({ navigation, openDrawer }) => {
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [errorPopup, setErrorPopup] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const showErrorPopup = (title, message) => {
    setErrorPopup({ visible: true, title, message });
  };

  const closeErrorPopup = () => {
    setErrorPopup({ visible: false, title: "", message: "" });
  };

  // ---------- Entry animations ----------
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-30)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(20)).current;
  const restOpacity = useRef(new Animated.Value(0)).current;

  // ---------- Fetch on mount ----------
  useEffect(() => {
    let isMounted = true;

    const fetchRecommendation = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const result = await apiClient.get(API_ENDPOINTS.RECOMMENDATION.GET);

        if (!isMounted) return;

        // ---- Auth errors during logout are expected — ignore silently ----
        if (result.status === 401 || result.status === 422) {
          return;
        }

        if (result.success && result.status === 200 && result.data) {
          setRecommendation(result.data);
        } else if (result.status === 404) {
          setLoadError(
            result.message || "No intermediate reading found for this cycle.",
          );
        } else {
          showErrorPopup(
            "Request Failed",
            result.message ||
              "Could not generate recommendations. Please try again.",
          );
        }
      } catch {
        if (!isMounted) return;
        showErrorPopup(
          "Unexpected Error",
          "Something went wrong. Please try again.",
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRecommendation();

    return () => {
      isMounted = false;
    };
  }, []);

  // ---------- Entry animation after data lands ----------
  useEffect(() => {
    if (!recommendation) return;

    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(heroTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(restOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    recommendation,
    headerOpacity,
    headerTranslateY,
    heroOpacity,
    heroTranslateY,
    restOpacity,
  ]);

  const handleBack = () => {
    if (navigation?.goBack) navigation.goBack();
    else navigation?.navigate?.("DashboardScreen");
  };

  // ---------- Loading ----------
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <ScreenBackground />
        <SmartRecommendationSkeleton />
      </SafeAreaView>
    );
  }

  // ---------- No data ----------
  if (!recommendation) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <ScreenBackground />
        <View style={styles.container}>
          <ScreenHeader
            title="Recommendations"
            subtitle="Insights for your current cycle"
            onMenuPress={openDrawer}
          />
          <EmptyState
            icon="bulb-outline"
            title="No insights yet"
            message={
              loadError ||
              "Add a reading mid-cycle to unlock personalized recommendations."
            }
          />
        </View>
        <ErrorPopup
          visible={errorPopup.visible}
          title={errorPopup.title}
          message={errorPopup.message}
          onClose={closeErrorPopup}
        />
      </SafeAreaView>
    );
  }

  // ---------- Full screen ----------
  const {
    headline,
    suggestions = [],
    unitsSoFar,
    daysElapsed,
    daysRemaining,
    dailyRate,
    averageDailyRate,
    projectedMonthUnits,
    historicalAverage,
    percentageVsAverage,
    currentStatus,
    nextStatus,
    nextThreshold,
    willCrossThreshold,
    billImpact,
  } = recommendation;

  const projectedRounded = Math.round(projectedMonthUnits ?? 0);
  const dailyRateRounded =
    dailyRate != null ? Number(Number(dailyRate).toFixed(1)) : 0;
  const avgDailyRateRounded =
    averageDailyRate != null ? Number(averageDailyRate).toFixed(1) : null;

  const percentage = percentageVsAverage;
  const isAboveAverage = percentage != null && percentage > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScreenBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Header ---------- */}
        <Animated.View
          style={{
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          }}
        >
          <ScreenHeader
            title="Recommendations"
            subtitle="Insights for your current cycle"
            onMenuPress={openDrawer}
          />
        </Animated.View>

        {/* ---------- Hero card ---------- */}
        <Animated.View
          style={{
            opacity: heroOpacity,
            transform: [{ translateY: heroTranslateY }],
          }}
        >
          <View style={styles.heroCard}>
            {/* Recommendation badge */}
            <RecommendationBadge />

            {/* Structured headline */}
            <RecommendationHeadline headline={headline} />

            {/* Status + percentage chips (quiet, below headline) */}
            <View style={styles.chipRow}>
              {currentStatus ? (
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{currentStatus}</Text>
                </View>
              ) : null}

              {percentage != null ? (
                <View
                  style={[
                    styles.percentPill,
                    isAboveAverage
                      ? styles.percentPillBad
                      : styles.percentPillGood,
                  ]}
                >
                  <Ionicons
                    name={isAboveAverage ? "trending-up" : "trending-down"}
                    size={12}
                    color={isAboveAverage ? COLORS.error : COLORS.success}
                  />
                  <Text
                    style={[
                      styles.percentText,
                      {
                        color: isAboveAverage ? COLORS.error : COLORS.success,
                      },
                    ]}
                  >
                    {Math.abs(percentage).toFixed(1)}%
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Suggestions */}
            {suggestions.length > 0 ? (
              <View style={styles.suggestionsWrap}>
                {suggestions.map((s, i) => (
                  <SuggestionRow
                    key={`${i}-${s}`}
                    text={s}
                    isLast={i === suggestions.length - 1}
                  />
                ))}
              </View>
            ) : null}
          </View>
        </Animated.View>

        {/* ---------- Stats grid ---------- */}
        <Animated.View style={{ opacity: restOpacity }}>
          <View style={styles.grid}>
            <View style={styles.gridRow}>
              <StatTile
                icon="flash-outline"
                variant="primary"
                value={unitsSoFar}
                unit="units"
                label="This cycle"
              />
              <StatTile
                icon="speedometer-outline"
                variant="info"
                value={dailyRateRounded}
                unit="units/day"
                label="Daily pace"
                caption={
                  avgDailyRateRounded
                    ? `vs. ${avgDailyRateRounded} usual`
                    : null
                }
              />
            </View>

            <View style={styles.gridRow}>
              <StatTile
                icon="calendar-outline"
                variant="warning"
                value={daysRemaining}
                unit="days"
                label="Until next reading"
                caption={`Day ${daysElapsed} of cycle`}
              />
              <StatTile
                icon="trending-up-outline"
                variant="solid"
                value={projectedRounded}
                unit="units"
                label="Projected total"
                caption={
                  historicalAverage
                    ? `Avg: ${Math.round(historicalAverage)}`
                    : null
                }
              />
            </View>
          </View>

          {/* ---------- Status risk banner ---------- */}
          {willCrossThreshold && nextStatus && nextThreshold ? (
            <View style={styles.bannerWrap}>
              <View style={styles.bannerTitleRow}>
                <Ionicons
                  name="warning-outline"
                  size={16}
                  color={COLORS.warning}
                />
                <Text style={styles.bannerTitle}>
                  On track to change status
                </Text>
              </View>
              <StatusRiskBanner
                currentStatus={currentStatus}
                nextStatus={nextStatus}
                nextThreshold={nextThreshold}
                projectedMonthUnits={projectedMonthUnits}
              />
            </View>
          ) : null}

          {/* ---------- Bill impact ---------- */}
          {billImpact ? (
            <SectionCard title="Bill Impact">
              <BillImpactCard
                currentBillAtCurrentStatus={
                  billImpact.currentBillAtCurrentStatus
                }
                projectedBillAtNextStatus={billImpact.projectedBillAtNextStatus}
                difference={billImpact.difference}
              />
            </SectionCard>
          ) : null}
        </Animated.View>
      </ScrollView>

      <ErrorPopup
        visible={errorPopup.visible}
        title={errorPopup.title}
        message={errorPopup.message}
        onClose={closeErrorPopup}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },

  // ---------- Hero card ----------
  heroCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.md,
    flexWrap: "wrap",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.primary,
  },
  statusText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  percentPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.circle,
    borderWidth: 1,
  },
  percentPillBad: {
    backgroundColor: "#FDECEA",
    borderColor: "#F5C6C2",
  },
  percentPillGood: {
    backgroundColor: "#E8F8EE",
    borderColor: "#A8DCBB",
  },
  percentText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.2,
  },
  suggestionsWrap: {
    marginTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xs,
  },

  // ---------- Stats grid ----------
  grid: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  gridRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },

  // ---------- Banner wrap ----------
  bannerWrap: {
    marginBottom: SPACING.md,
  },
  bannerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.xxs,
  },
  bannerTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.warning,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
});

export default SmartRecommendationScreen;
