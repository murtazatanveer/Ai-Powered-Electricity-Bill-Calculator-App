// src/screens/SmartRecommendationScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../Components/Colors";

// --- MOCK DATA ---
const CHART_DATA = [
  { month: "Jan", usage: 320 },
  { month: "Feb", usage: 280 },
  { month: "Mar", usage: 310 },
  { month: "Apr", usage: 360 },
  { month: "May", usage: 410 },
  { month: "Jun", usage: 485 }, // The current AI prediction
];

// Mock Recommendations (Untouched)
const RECOMMENDATIONS = [
  {
    id: "1",
    icon: "air-conditioner",
    title: "Optimize AC Usage",
    desc: "Running your AC at 26°C instead of 22°C can reduce cooling costs by up to 30%.",
    savings: "PKR 1,200",
    priority: "High",
  },
  {
    id: "2",
    icon: "washing-machine",
    title: "Shift Heavy Loads",
    desc: "Run your washing machine and dishwasher during off-peak hours (11 PM - 7 AM) to save on electricity costs.",
    savings: "PKR 450",
    priority: "Medium",
  },
  {
    id: "3",
    icon: "lightbulb-on",
    title: "Switch to LED Bulbs",
    desc: "Replacing old incandescent bulbs with LED bulbs can reduce your lighting energy consumption by 75%.",
    savings: "PKR 200",
    priority: "Low",
  },
];

export default function SmartRecommendationScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [hasHistory, setHasHistory] = useState(true);
  const [error, setError] = useState(false);

  // Chart Interactive State
  const [selectedBar, setSelectedBar] = useState(null);

  // Animated values for the chart bars
  const barAnimations = useRef(
    CHART_DATA.map(() => new Animated.Value(0)),
  ).current;

  // Simulate Data Fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);

      // Trigger the bar animations on load
      Animated.stagger(
        80,
        barAnimations.map((anim) =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ),
      ).start();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  // Calculate summary stats
  const avgUsage = Math.round(
    CHART_DATA.reduce((acc, curr) => acc + curr.usage, 0) / CHART_DATA.length,
  );
  const maxUsage = Math.max(...CHART_DATA.map((d) => d.usage));
  const minUsage = Math.min(...CHART_DATA.map((d) => d.usage));
  const lastMonth = CHART_DATA[CHART_DATA.length - 2].usage;
  const currentMonth = CHART_DATA[CHART_DATA.length - 1].usage;
  const percentageChange = (
    ((currentMonth - lastMonth) / lastMonth) *
    100
  ).toFixed(0);

  // --- RENDER HELPERS ---

  // 1. Premium Animated Trend Chart (FIXED NATIVE DRIVER)
  const PremiumTrendChart = ({ data }) => {
    const maxValue = Math.max(...data.map((d) => d.usage));
    const containerHeight = 160; // The fixed height of the chart container

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartGrid}>
          {/* Subtle Horizontal Grid Lines */}
          {[0, 25, 50, 75, 100].map((line, index) => (
            <View key={index} style={[styles.gridLine, { top: `${line}%` }]} />
          ))}
        </View>

        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const heightPercentage = (item.usage / maxValue) * 100;
            const isPredicted = index === data.length - 1;

            // Calculate fixed height based on percentage for the wrapper
            const barHeight = (containerHeight * heightPercentage) / 100;

            return (
              <TouchableOpacity
                key={index}
                style={styles.barWrapper}
                activeOpacity={0.7}
                onPress={() =>
                  setSelectedBar(index === selectedBar ? null : index)
                }
              >
                {/* 
                  ✅ FIX: Animate scaleY instead of height. 
                  We set a fixed height on the wrapper and scale it from 0 to 1.
                */}
                <Animated.View
                  style={[
                    styles.barTrack,
                    {
                      height: barHeight,
                      transform: [
                        {
                          scaleY: barAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {/* Gradient-like fill */}
                  <View
                    style={[
                      styles.barFill,
                      isPredicted && styles.barFillPredicted,
                    ]}
                  />

                  {/* Glow effect for the predicted month */}
                  {isPredicted && <View style={styles.barGlow} />}
                </Animated.View>

                {/* Tooltip Pop-up */}
                {selectedBar === index && (
                  <View style={styles.tooltip}>
                    <View style={styles.tooltipArrow} />
                    <Text style={styles.tooltipText}>{item.usage} kWh</Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.barLabel,
                    isPredicted && styles.barLabelPredicted,
                  ]}
                >
                  {item.month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // --- UI STATES (UNTOUCHED) ---

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.skeletonHeader} />
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonBox} />
          <View style={styles.skeletonBox} />
        </View>
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonText} />
        <View style={styles.skeletonCard} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="connection-error"
            size={60}
            color={COLORS.error}
          />
          <Text style={styles.errorTitle}>Connection Issue</Text>
          <Text style={styles.errorDesc}>
            We couldn't load your prediction data. Please check your connection.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasHistory) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="chart-line"
            size={60}
            color={COLORS.primary}
          />
          <Text style={styles.emptyTitle}>Not Enough Data</Text>
          <Text style={styles.emptyDesc}>
            We need at least 2 meter readings to generate a reliable prediction.
            Please submit a new reading to get started.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setHasHistory(true)}
          >
            <Text style={styles.retryText}>I've submitted a reading</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- SUCCESS STATE ---
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* --- 1. HERO CARD --- */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.heroLabel}>Predicted Usage</Text>
              <View style={styles.heroMainRow}>
                <Text style={styles.heroValue}>485</Text>
                <Text style={styles.heroUnit}>kWh</Text>
              </View>
            </View>
            <View style={styles.aiBadge}>
              <MaterialCommunityIcons name="brain" size={14} color="#FFFFFF" />
              <Text style={styles.aiBadgeText}>AI Prediction</Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroFooter}>
            <View>
              <Text style={styles.heroFooterLabel}>Estimated Bill</Text>
              <Text style={styles.heroTotal}>PKR 4,850</Text>
            </View>
            <View style={styles.heroMeta}>
              <Text style={styles.heroMetaText}>Month: July, 2026</Text>
              <Text style={styles.heroMetaText}>Updated: Today 10:30 AM</Text>
            </View>
          </View>
        </View>

        {/* --- 2. CONFIDENCE & 3. COMPARISON ROW --- */}
        <View style={styles.doubleRow}>
          <View style={styles.halfCard}>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color={COLORS.primarySupport}
            />
            <Text style={styles.confidencePercent}>92%</Text>
            <Text style={styles.confidenceLabel}>Confidence</Text>
            <View style={styles.confidenceBarBg}>
              <View style={[styles.confidenceBarFill, { width: "92%" }]} />
            </View>
            <Text style={styles.confidenceNote}>
              Based on your last 6 readings.
            </Text>
          </View>

          <View style={styles.halfCard}>
            <MaterialCommunityIcons
              name="trending-up"
              size={24}
              color={COLORS.error}
            />
            <Text style={styles.compValue}>+20.5%</Text>
            <Text style={styles.compLabel}>vs Last Month</Text>
            <View style={styles.compRow}>
              <View>
                <Text style={styles.compSubLabel}>Previous</Text>
                <Text style={styles.compSubValue}>402 kWh</Text>
              </View>
              <View>
                <Text style={styles.compSubLabel}>Predicted</Text>
                <Text style={styles.compSubValue}>485 kWh</Text>
              </View>
            </View>
          </View>
        </View>

        {/* --- 4. BILL BREAKDOWN --- */}
        <Text style={styles.sectionHeader}>Bill Breakdown</Text>
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Energy Charges (485 kWh)</Text>
            <Text style={styles.breakdownValue}>PKR 3,880</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Taxes & Surcharges</Text>
            <Text style={styles.breakdownValue}>PKR 970</Text>
          </View>
          <View style={[styles.breakdownRow, styles.breakdownTotal]}>
            <Text style={styles.breakdownTotalLabel}>Estimated Total</Text>
            <Text style={styles.breakdownTotalValue}>PKR 4,850</Text>
          </View>
        </View>

        {/* --- 5. RECOMMENDATIONS --- */}
        <Text style={styles.sectionHeader}>Smart Suggestions</Text>
        {RECOMMENDATIONS.map((item) => (
          <View key={item.id} style={styles.recCard}>
            <View
              style={[
                styles.recIconBox,
                { backgroundColor: COLORS.primarySupport + "20" },
              ]}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color={COLORS.primarySupport}
              />
            </View>
            <View style={styles.recContent}>
              <View style={styles.recHeader}>
                <Text style={styles.recTitle}>{item.title}</Text>
                <View
                  style={[
                    styles.priorityBadge,
                    item.priority === "High" && styles.priorityHigh,
                    item.priority === "Medium" && styles.priorityMedium,
                    item.priority === "Low" && styles.priorityLow,
                  ]}
                >
                  <Text style={styles.priorityText}>{item.priority}</Text>
                </View>
              </View>
              <Text style={styles.recDesc}>{item.desc}</Text>
              <Text style={styles.recSavings}>
                💰 Potential Savings: {item.savings}
              </Text>
            </View>
          </View>
        ))}

        {/* --- 6. ALERT CARD --- */}
        <View style={styles.alertCard}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={24}
            color={COLORS.error}
          />
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Higher Usage Detected</Text>
            <Text style={styles.alertDesc}>
              Your predicted usage is significantly higher than your average.
              Try shifting your heavy appliance usage to off-peak hours to save
              money.
            </Text>
          </View>
        </View>

        {/* ============================================================
            🔥 COMPLETELY REDESIGNED CONSUMPTION TREND SECTION
            ============================================================ */}
        <Text style={styles.sectionHeader}>Consumption Trend</Text>
        <View style={styles.trendCard}>
          {/* Key Summary Metrics */}
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Average</Text>
              <Text style={styles.summaryValue}>{avgUsage} kWh</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Highest</Text>
              <Text style={styles.summaryValue}>{maxUsage} kWh</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Lowest</Text>
              <Text style={styles.summaryValue}>{minUsage} kWh</Text>
            </View>
            <View style={[styles.summaryItem, styles.summaryItemLast]}>
              <Text style={styles.summaryLabel}>Trend</Text>
              <View style={styles.trendIndicator}>
                <MaterialCommunityIcons
                  name={percentageChange > 0 ? "arrow-up" : "arrow-down"}
                  size={16}
                  color={
                    percentageChange > 0 ? COLORS.error : COLORS.primarySupport
                  }
                />
                <Text
                  style={[
                    styles.trendText,
                    {
                      color:
                        percentageChange > 0
                          ? COLORS.error
                          : COLORS.primarySupport,
                    },
                  ]}
                >
                  {percentageChange}%
                </Text>
              </View>
            </View>
          </View>

          {/* The Premium Animated Chart */}
          <View style={styles.chartWrapper}>
            <PremiumTrendChart data={CHART_DATA} />

            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: COLORS.primary },
                  ]}
                />
                <Text style={styles.legendText}>Historical</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: COLORS.primarySupport,
                      width: 10,
                      height: 10,
                    },
                  ]}
                />
                <Text style={styles.legendText}>AI Predicted</Text>
              </View>
            </View>
          </View>

          {/* Chart Analysis Insight */}
          <View style={styles.insightContainer}>
            <MaterialCommunityIcons
              name="lightbulb-on-outline"
              size={18}
              color={COLORS.success}
            />
            <Text style={styles.insightText}>
              {percentageChange > 0
                ? `Consumption is trending upward. You used ${percentageChange}% more than last month.`
                : `Great job! Consumption is trending downward by ${Math.abs(percentageChange)}%.`}
            </Text>
          </View>
        </View>
        {/* ============================================================
            END REDESIGNED CONSUMPTION TREND SECTION
            ============================================================ */}

        {/* --- 8. AI INSIGHT CARD --- */}
        <View style={styles.insightCard}>
          <MaterialCommunityIcons
            name="lightbulb-on"
            size={24}
            color={COLORS.success}
          />
          <Text style={styles.insightTitle}>AI Insight</Text>
          <Text style={styles.insightBody}>
            Based on your recent electricity consumption, your bill is expected
            to increase by approximately 20% this month. Reducing evening
            air-conditioner usage between 6 PM and 9 PM could significantly
            lower your estimated bill.
          </Text>
        </View>

        {/* --- 9. PREDICTION INFO --- */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.infoText}>
            Predictions improve as you submit more meter readings. Share your
            reading today to increase forecast accuracy for next month.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- CONTAINER & LAYOUT ---
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    padding: 16,
    paddingTop: 10,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  // --- LOADING SKELETON ---
  skeletonHeader: {
    height: 30,
    backgroundColor: "#DDE6C8",
    borderRadius: 8,
    marginBottom: 20,
    width: "60%",
  },
  skeletonCard: {
    height: 120,
    backgroundColor: "#DDE6C8",
    borderRadius: 16,
    marginBottom: 16,
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  skeletonBox: {
    width: "48%",
    height: 100,
    backgroundColor: "#DDE6C8",
    borderRadius: 16,
  },
  skeletonText: {
    height: 20,
    backgroundColor: "#DDE6C8",
    borderRadius: 8,
    marginBottom: 16,
    width: "40%",
  },

  // --- ERROR & EMPTY STATES ---
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 16,
  },
  errorDesc: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.7,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primarySupport,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.7,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },

  // --- 1. HERO CARD ---
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroLabel: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.6,
    marginBottom: 4,
  },
  heroMainRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  heroValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  heroUnit: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: 4,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primarySupport,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  aiBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(29, 46, 27, 0.06)",
    marginVertical: 16,
  },
  heroFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  heroFooterLabel: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.6,
  },
  heroTotal: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primarySupport,
  },
  heroMeta: {
    alignItems: "flex-end",
  },
  heroMetaText: {
    fontSize: 12,
    color: COLORS.primary,
    opacity: 0.5,
  },

  // --- 2. DOUBLE ROW (Confidence + Comparison) ---
  doubleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },
  halfCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  confidencePercent: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 4,
  },
  confidenceLabel: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.6,
    marginBottom: 8,
  },
  confidenceBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(29, 46, 27, 0.1)",
    borderRadius: 3,
    marginBottom: 8,
  },
  confidenceBarFill: {
    height: "100%",
    backgroundColor: COLORS.primarySupport,
    borderRadius: 3,
  },
  confidenceNote: {
    fontSize: 10,
    color: COLORS.primary,
    opacity: 0.5,
    textAlign: "center",
  },
  compValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.error,
    marginTop: 4,
  },
  compLabel: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.6,
    marginBottom: 8,
  },
  compRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 4,
  },
  compSubLabel: {
    fontSize: 10,
    color: COLORS.primary,
    opacity: 0.5,
  },
  compSubValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // --- 4. BILL BREAKDOWN ---
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 12,
  },
  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(29, 46, 27, 0.04)",
  },
  breakdownLabel: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.7,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
  },
  breakdownTotal: {
    borderBottomWidth: 0,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  breakdownTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  breakdownTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primarySupport,
  },

  // --- 5. RECOMMENDATIONS ---
  recCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  recIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recContent: {
    flex: 1,
  },
  recHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  priorityBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  priorityHigh: {
    backgroundColor: COLORS.error,
  },
  priorityMedium: {
    backgroundColor: COLORS.success,
  },
  priorityLow: {
    backgroundColor: "rgba(29, 46, 27, 0.1)",
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  recDesc: {
    fontSize: 13,
    color: COLORS.primary,
    opacity: 0.7,
    marginBottom: 4,
  },
  recSavings: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primarySupport,
  },

  // --- 6. ALERT CARD ---
  alertCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 63, 51, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 63, 51, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 4,
  },
  alertDesc: {
    fontSize: 13,
    color: COLORS.primary,
    opacity: 0.7,
    lineHeight: 20,
  },

  // --- 7. CONSUMPTION TREND (REDESIGNED) ---
  trendCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    backgroundColor: "rgba(200, 210, 166, 0.3)",
    borderRadius: 12,
    padding: 12,
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryItemLast: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(29, 46, 27, 0.1)",
  },
  summaryLabel: {
    fontSize: 10,
    color: COLORS.primary,
    opacity: 0.5,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  trendIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendText: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 2,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  chartContainer: {
    height: 160,
    position: "relative",
    marginBottom: 8,
  },
  chartGrid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "space-between",
    zIndex: 0,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(29, 46, 27, 0.05)",
  },
  barsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    zIndex: 1,
    paddingBottom: 4,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
    position: "relative",
  },
  barTrack: {
    width: "50%",
    backgroundColor: "rgba(29, 46, 27, 0.05)",
    borderRadius: 6,
    overflow: "hidden",
    minHeight: 4,
  },
  barFill: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  barFillPredicted: {
    backgroundColor: COLORS.primarySupport,
    shadowColor: COLORS.primarySupport,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  barGlow: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    backgroundColor: COLORS.primarySupport,
    opacity: 0.2,
    borderRadius: 20,
  },
  barLabel: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.primary,
    opacity: 0.6,
  },
  barLabelPredicted: {
    fontWeight: "700",
    color: COLORS.primarySupport,
    opacity: 1,
  },
  tooltip: {
    position: "absolute",
    top: -40,
    backgroundColor: "rgba(29, 46, 27, 0.9)",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  tooltipArrow: {
    position: "absolute",
    bottom: -6,
    left: "50%",
    marginLeft: -6,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "rgba(29, 46, 27, 0.9)",
  },
  tooltipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.primary,
    opacity: 0.7,
  },
  insightContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 222, 66, 0.15)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    opacity: 0.8,
    marginLeft: 8,
  },

  // --- 8. AI INSIGHT CARD ---
  insightCard: {
    backgroundColor: "rgba(255, 222, 66, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 222, 66, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 8,
  },
  insightBody: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.8,
    lineHeight: 22,
    marginTop: 4,
  },

  // --- 9. INFO BOX ---
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 12,
    padding: 14,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    opacity: 0.7,
    marginLeft: 8,
    lineHeight: 20,
  },
});
