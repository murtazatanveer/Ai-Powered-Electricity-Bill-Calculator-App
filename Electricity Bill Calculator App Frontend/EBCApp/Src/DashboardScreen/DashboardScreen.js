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
import PrimaryButton from "../Common/Components/PrimaryButton";
import DashboardSkeleton from "../Common/Components/DashboardSkeleton";

import ConsumerInfoCard from "./Components/ConsumerInfoCard";
import QuickStatGrid from "./Components/QuickStatGrid";
import UnitsBarChart from "./Components/UnitsBarChart";

import { formatCurrency } from "../ReadingsScreen/Utils/formatMonthYear";
import apiClient from "../Config/apiClient";
import { API_ENDPOINTS } from "../Config/ApiEndpoint";

const DashboardScreen = ({ navigation, route, openDrawer }) => {
  // ---------- Data source ----------
  const passedBillData = route?.params?.billData ?? null;

  const [billData, setBillData] = useState(passedBillData);
  const [isLoading, setIsLoading] = useState(!passedBillData);
  const [loadError, setLoadError] = useState("");

  // Selected billing-history month
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  // ---------- Fetch on mount if no data was passed ----------
  useEffect(() => {
    if (passedBillData) return;

    let isMounted = true;

    const fetchBillData = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const result = await apiClient.get(API_ENDPOINTS.BILL.GET_BILL_DATA);

        if (!isMounted) return;

        if (result.success && result.status === 200 && result.data) {
          setBillData(result.data);
        } else {
          setLoadError(
            result.message ||
              "Could not load your bill data. Please try again.",
          );
        }
      } catch {
        if (!isMounted) return;
        setLoadError("Could not load your bill data. Please try again.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBillData();

    return () => {
      isMounted = false;
    };
  }, [passedBillData]);

  // ---------- Derived ----------
  const billingHistory = billData?.billingHistory || [];
  const selectedEntry = billingHistory[selectedMonthIndex] || null;

  const hasRenderableData = Boolean(billData && billingHistory.length > 0);

  // ---------- Entry animations ----------
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const infoTranslateY = useRef(new Animated.Value(30)).current;
  const infoOpacity = useRef(new Animated.Value(0)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const chartOpacity = useRef(new Animated.Value(0)).current;
  const actionsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Only animate when we have data to show
    if (!hasRenderableData) return;

    Animated.sequence([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(infoTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(infoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(statsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(chartOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(actionsOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [
    hasRenderableData,
    headerOpacity,
    infoTranslateY,
    infoOpacity,
    statsOpacity,
    chartOpacity,
    actionsOpacity,
  ]);

  // ---------- Actions ----------
  const handleAddReading = () => {
    navigation?.navigate("BillCalculationScreen");
  };

  const handlePrediction = () => {
    navigation?.navigate("PredictionScreen");
  };

  const handleRetry = () => {
    setBillData(null);
    setIsLoading(true);
    setLoadError("");

    // Trigger the effect by resetting state; the effect will fetch again.
    // Using a small tick to guarantee a state change even if values are equal.
    setTimeout(async () => {
      try {
        const result = await apiClient.get(API_ENDPOINTS.BILL.GET_BILL_DATA);
        if (result.success && result.status === 200 && result.data) {
          setBillData(result.data);
        } else {
          setLoadError(
            result.message ||
              "Could not load your bill data. Please try again.",
          );
        }
      } catch {
        setLoadError("Could not load your bill data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }, 0);
  };

  // ============================================================
  // RENDER PRIORITY
  //   1. No bill data + still loading  → DashboardSkeleton
  //   2. No bill data + done loading   → EmptyState with Retry
  //   3. Has bill data                 → Full dashboard
  // ============================================================

  // ---------- 1. Skeleton while data is missing ----------
  if (!hasRenderableData && isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <ScreenBackground />
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  // ---------- 2. Empty / error state ----------
  if (!hasRenderableData) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <ScreenBackground />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ScreenHeader
            title="Dashboard"
            subtitle="Your electricity overview"
            onMenuPress={openDrawer}
          />
          <View style={styles.emptyCard}>
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color={COLORS.warning}
            />
            <Text style={styles.emptyTitle}>No data available</Text>
            <Text style={styles.emptyMessage}>
              {loadError ||
                "We couldn't find your bill data. Please try again later."}
            </Text>
            <PrimaryButton
              title="Retry"
              onPress={handleRetry}
              iconName="refresh-outline"
              style={{ marginTop: SPACING.md }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ---------- 3. Full dashboard ----------
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScreenBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Header ---------- */}
        <Animated.View style={{ opacity: headerOpacity }}>
          <ScreenHeader
            title="Dashboard"
            subtitle="Your electricity overview"
            onMenuPress={openDrawer}
          />
        </Animated.View>

        {/* ---------- Consumer Info ---------- */}
        <Animated.View
          style={{
            opacity: infoOpacity,
            transform: [{ translateY: infoTranslateY }],
          }}
        >
          <ConsumerInfoCard data={billData} />
        </Animated.View>

        {/* ---------- Quick Stats ---------- */}
        <Animated.View style={{ opacity: statsOpacity }}>
          <QuickStatGrid data={billData} />
        </Animated.View>

        {/* ---------- Billing History Chart ---------- */}
        <Animated.View style={{ opacity: chartOpacity }}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Billing History</Text>
                <Text style={styles.cardSubtitle}>
                  Units consumed per month
                </Text>
              </View>
            </View>

            {selectedEntry ? (
              <View style={styles.billBadge}>
                <View style={styles.billBadgeLeft}>
                  <View style={styles.billBadgeIcon}>
                    <Ionicons
                      name="receipt-outline"
                      size={16}
                      color={COLORS.primary}
                    />
                  </View>
                  <View>
                    <Text style={styles.billBadgeMonth}>
                      {selectedEntry.month}
                    </Text>
                    <Text style={styles.billBadgeLabel}>Electricity Bill</Text>
                  </View>
                </View>

                <Text style={styles.billBadgeValue}>
                  {formatCurrency(selectedEntry.bill)}
                </Text>
              </View>
            ) : null}

            <UnitsBarChart
              data={billingHistory}
              selectedIndex={selectedMonthIndex}
              onSelect={setSelectedMonthIndex}
            />
          </View>
        </Animated.View>

        {/* ---------- Action Buttons ---------- */}
        <Animated.View
          style={[styles.actionsWrap, { opacity: actionsOpacity }]}
        >
          <PrimaryButton
            title="Add New Reading"
            onPress={handleAddReading}
            iconName="add-circle-outline"
            style={styles.actionButton}
          />
          <PrimaryButton
            title="Bill Prediction"
            onPress={handlePrediction}
            iconName="trending-up-outline"
            variant="outline"
            style={styles.actionButton}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
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
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // ---------- Bill badge ----------
  billBadge: {
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
  billBadgeIcon: {
    width: 34,
    height: 34,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.small,
  },
  billBadgeMonth: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  billBadgeLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 1,
  },
  billBadgeValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    letterSpacing: -0.5,
  },

  // ---------- Empty ----------
  emptyCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyMessage: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginTop: SPACING.xs,
    lineHeight: 20,
  },

  actionsWrap: {
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  actionButton: {
    width: "100%",
  },
});

export default DashboardScreen;
