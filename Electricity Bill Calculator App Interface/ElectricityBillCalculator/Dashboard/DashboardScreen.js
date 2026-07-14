// src/screens/DashboardScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../Components/Colors";

// --- MOCK DATA GENERATORS ---

// 1. Consumption Trend (6 Months)
const TREND_DATA = [
  { month: "Jan", usage: 320 },
  { month: "Feb", usage: 280 },
  { month: "Mar", usage: 310 },
  { month: "Apr", usage: 360 },
  { month: "May", usage: 410 },
  { month: "Jun", usage: 485 }, // Predicted
];

// 2. Bill Breakdown
const BILL_BREAKDOWN = {
  energy: 3880,
  taxes: 500,
  fuelAdjustment: 150,
  fixedCharges: 200,
  others: 120,
  total: 4850,
};

// 3. Billing History (Recent)
const RECENT_BILLS = [
  {
    id: "1",
    month: "June 2026",
    units: 485,
    amount: 4850,
    due: "25 Jun",
    status: "Unpaid",
  },
  {
    id: "2",
    month: "May 2026",
    units: 410,
    amount: 4100,
    due: "25 May",
    status: "Paid",
  },
  {
    id: "3",
    month: "Apr 2026",
    units: 360,
    amount: 3600,
    due: "25 Apr",
    status: "Paid",
  },
];

// 4. Usage Insights
const INSIGHTS = [
  {
    id: "1",
    icon: "arrow-up",
    title: "Highest Usage Day",
    desc: "Monday, June 15th (45 kWh)",
    color: COLORS.error,
  },
  {
    id: "2",
    icon: "arrow-down",
    title: "Lowest Usage Day",
    desc: "Wednesday, June 3rd (12 kWh)",
    color: COLORS.primarySupport,
  },
  {
    id: "3",
    icon: "chart-line",
    title: "Avg Daily Usage",
    desc: "16.1 kWh per day",
    color: COLORS.primary,
  },
  {
    id: "4",
    icon: "cash",
    title: "Potential Savings",
    desc: "PKR 750 if you follow our tips",
    color: COLORS.success,
  },
];

// 5. Highlights
const HIGHLIGHTS = [
  {
    id: "1",
    icon: "check-circle",
    label: "Bill Prediction Ready",
    color: COLORS.primarySupport,
  },
  {
    id: "2",
    icon: "update",
    label: "Tariff Updated 2 days ago",
    color: COLORS.primary,
  },
  {
    id: "3",
    icon: "lightbulb-on",
    label: "Recommendations Available",
    color: COLORS.success,
  },
  {
    id: "4",
    icon: "bell",
    label: "Reading Reminder in 5 days",
    color: COLORS.error,
  },
];

export default function DashboardScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Chart Animations (Trend)
  const barAnimations = useRef(
    TREND_DATA.map(() => new Animated.Value(0)),
  ).current;

  // Calculate Metrics
  const currentMonth = TREND_DATA[TREND_DATA.length - 1];
  const prevMonth = TREND_DATA[TREND_DATA.length - 2];
  const percChange = (
    ((currentMonth.usage - prevMonth.usage) / prevMonth.usage) *
    100
  ).toFixed(0);
  const isUp = parseInt(percChange) > 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      // Trigger Chart Animation
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
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  // --- RENDER HELPERS ---

  // Helper for Animated Bar Chart
  const AnimatedBarChart = ({ data, highlightLast }) => {
    const maxVal = Math.max(...data.map((d) => d.usage));
    const containerHeight = 140;
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartGrid}>
          {[0, 25, 50, 75, 100].map((l, i) => (
            <View key={i} style={[styles.gridLine, { top: `${l}%` }]} />
          ))}
        </View>
        <View style={styles.barsContainer}>
          {data.map((item, index) => {
            const isLast = highlightLast && index === data.length - 1;
            const heightPerc = (item.usage / maxVal) * 100;
            return (
              <View key={index} style={styles.barWrapper}>
                <Animated.View
                  style={[
                    styles.barTrack,
                    {
                      height: (containerHeight * heightPerc) / 100,
                      transform: [{ scaleY: barAnimations[index] }],
                    },
                  ]}
                >
                  <View
                    style={[styles.barFill, isLast && styles.barFillCurrent]}
                  />
                </Animated.View>
                <Text
                  style={[styles.barLabel, isLast && styles.barLabelCurrent]}
                >
                  {item.month}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  // Summary Card Component
  const SummaryCard = ({ icon, label, value, subValue, color, isPositive }) => (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: color + "20" }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      {subValue && (
        <View style={styles.summarySubRow}>
          <MaterialCommunityIcons
            name={isPositive ? "arrow-up" : "arrow-down"}
            size={14}
            color={color}
          />
          <Text style={[styles.summarySubValue, { color }]}>{subValue}</Text>
        </View>
      )}
    </View>
  );

  // Recent Bill Card
  const BillCard = ({ item }) => (
    <View style={styles.billCard}>
      <View style={styles.billLeft}>
        <Text style={styles.billMonth}>{item.month}</Text>
        <Text style={styles.billDue}>Due: {item.due}</Text>
      </View>
      <View style={styles.billRight}>
        <Text style={styles.billAmount}>
          PKR {item.amount.toLocaleString()}
        </Text>
        <View
          style={[
            styles.billStatus,
            item.status === "Paid" ? styles.billPaid : styles.billUnpaid,
          ]}
        >
          <Text style={styles.billStatusText}>{item.status}</Text>
        </View>
        <View style={styles.billActions}>
          <TouchableOpacity style={styles.billActionBtn}>
            <Text style={styles.billActionText}>📄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.billActionBtn}>
            <Text style={styles.billActionText}>👁️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // --- UI STATES ---

  // 1. Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.skeletonWelcome} />
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonBox} />
          <View style={styles.skeletonBox} />
        </View>
        <View style={styles.skeletonChart} />
        <View style={styles.skeletonBill} />
        <View style={styles.skeletonBill} />
      </SafeAreaView>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="database-remove"
            size={60}
            color={COLORS.error}
          />
          <Text style={styles.errorTitle}>Failed to Load Dashboard</Text>
          <Text style={styles.errorDesc}>
            We couldn't retrieve your data. Please try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 3. Success State
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* ================= 1. WELCOME SECTION ================= */}
        <View style={styles.welcomeContainer}>
          <View>
            <Text style={styles.welcomeGreeting}>Good Morning,</Text>
            <Text style={styles.welcomeName}>User</Text>
          </View>
          <View style={styles.welcomeMeta}>
            <Text style={styles.welcomeDate}>June 2026</Text>
            <Text style={styles.welcomeSub}>15 days left</Text>
          </View>
        </View>

        {/* ================= 2. MONTHLY SUMMARY CARDS ================= */}
        <View style={styles.summaryRow}>
          <SummaryCard
            icon="flash"
            label="Usage"
            value="485 kWh"
            color={COLORS.primary}
          />
          <SummaryCard
            icon="cash"
            label="Est. Bill"
            value="PKR 4,850"
            color={COLORS.primarySupport}
          />
          <SummaryCard
            icon="clock"
            label="Avg Daily"
            value="16.1 kWh"
            color={COLORS.success}
          />
          <SummaryCard
            icon="calendar"
            label="Days Left"
            value="15"
            color={COLORS.error}
          />
        </View>

        {/* ================= 3. CONSUMPTION OVERVIEW & 4. TREND ================= */}
        <View style={styles.trendSection}>
          <View style={styles.trendHeader}>
            <Text style={styles.sectionTitle}>Consumption Overview</Text>
            <View style={styles.trendChip}>
              <MaterialCommunityIcons
                name={isUp ? "arrow-up" : "arrow-down"}
                size={14}
                color={isUp ? COLORS.error : COLORS.primarySupport}
              />
              <Text
                style={[
                  styles.trendChipText,
                  { color: isUp ? COLORS.error : COLORS.primarySupport },
                ]}
              >
                {Math.abs(parseInt(percChange))}%
              </Text>
            </View>
          </View>
          <View style={styles.comparisonRow}>
            <View>
              <Text style={styles.compLabel}>Previous</Text>
              <Text style={styles.compVal}>{prevMonth.usage} kWh</Text>
            </View>
            <View>
              <Text style={styles.compLabel}>Predicted</Text>
              <Text style={styles.compVal}>{currentMonth.usage} kWh</Text>
            </View>
          </View>
          <AnimatedBarChart data={TREND_DATA} highlightLast={true} />
        </View>

        {/* ================= 5. ESTIMATED BILL BREAKDOWN ================= */}
        <Text style={styles.sectionTitle}>Bill Breakdown</Text>
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownRow}>
            <Text style={styles.bdLabel}>Energy Charges</Text>
            <Text style={styles.bdValue}>PKR {BILL_BREAKDOWN.energy}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.bdLabel}>Taxes</Text>
            <Text style={styles.bdValue}>PKR {BILL_BREAKDOWN.taxes}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.bdLabel}>Fuel Adjustment</Text>
            <Text style={styles.bdValue}>
              PKR {BILL_BREAKDOWN.fuelAdjustment}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.bdLabel}>Fixed Charges</Text>
            <Text style={styles.bdValue}>
              PKR {BILL_BREAKDOWN.fixedCharges}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.bdLabel}>Others</Text>
            <Text style={styles.bdValue}>PKR {BILL_BREAKDOWN.others}</Text>
          </View>
          <View style={[styles.breakdownRow, styles.breakdownTotal]}>
            <Text style={styles.bdTotalLabel}>Estimated Total</Text>
            <Text style={styles.bdTotalValue}>PKR {BILL_BREAKDOWN.total}</Text>
          </View>
        </View>

        {/* ================= 6. BILLING HISTORY PREVIEW ================= */}
        <View style={styles.historyHeader}>
          <Text style={styles.sectionTitle}>Billing History</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Reading History")}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        {RECENT_BILLS.map((item) => (
          <BillCard key={item.id} item={item} />
        ))}

        {/* ================= 7. MONTHLY COMPARISON ================= */}
        <Text style={styles.sectionTitle}>Monthly Comparison</Text>
        <View style={styles.compCard}>
          <View style={styles.compRowLeft}>
            <Text style={styles.compTitle}>vs Last Month</Text>
            <Text style={styles.compBigVal}>
              {Math.abs(parseInt(percChange))}%
            </Text>
            <Text style={styles.compSub}>
              {isUp ? "Higher" : "Lower"} usage
            </Text>
          </View>
          <View style={styles.compDivider} />
          <View style={styles.compRowRight}>
            <View style={styles.compMiniRow}>
              <Text style={styles.compMiniLabel}>Units</Text>
              <Text style={styles.compMiniVal}>
                {currentMonth.usage - prevMonth.usage} kWh
              </Text>
            </View>
            <View style={styles.compMiniRow}>
              <Text style={styles.compMiniLabel}>Bill</Text>
              <Text style={styles.compMiniVal}>
                PKR {BILL_BREAKDOWN.total - prevMonth.usage * 10}
              </Text>
            </View>
          </View>
        </View>

        {/* ================= 8. USAGE INSIGHTS ================= */}
        <Text style={styles.sectionTitle}>Insights</Text>
        <View style={styles.insightRow}>
          {INSIGHTS.map((item) => (
            <View key={item.id} style={styles.insightCard}>
              <MaterialCommunityIcons
                name={item.icon}
                size={20}
                color={item.color}
              />
              <Text style={styles.insightTitle}>{item.title}</Text>
              <Text style={styles.insightDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>

        {/* ================= 9. QUICK ACTIONS ================= */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: COLORS.primarySupport },
            ]}
            onPress={() => navigation.navigate("CaptureMeter")}
          >
            <MaterialCommunityIcons name="camera" size={24} color="#FFF" />
            <Text style={styles.actionBtnText}>New Reading</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.primary }]}
            onPress={() => navigation.navigate("Reading History")}
          >
            <MaterialCommunityIcons name="history" size={24} color="#FFF" />
            <Text style={styles.actionBtnText}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
            onPress={() => navigation.navigate("Smart Recommendation")}
          >
            <MaterialCommunityIcons
              name="lightbulb-on"
              size={24}
              color="#FFF"
            />
            <Text style={styles.actionBtnText}>Smart Tips</Text>
          </TouchableOpacity>
        </View>

        {/* ================= 10. DASHBOARD HIGHLIGHTS ================= */}
        <Text style={styles.sectionTitle}>Highlights</Text>
        <View style={styles.highlightsRow}>
          {HIGHLIGHTS.map((item) => (
            <View
              key={item.id}
              style={[styles.highlightCard, { borderColor: item.color + "40" }]}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={20}
                color={item.color}
              />
              <Text style={styles.highlightText}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContainer: { padding: 16, paddingTop: 10 },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  // --- LOADING SKELETON ---
  skeletonWelcome: {
    height: 60,
    backgroundColor: "#DDE6C8",
    borderRadius: 12,
    marginBottom: 20,
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  skeletonBox: {
    flex: 1,
    height: 80,
    backgroundColor: "#DDE6C8",
    borderRadius: 12,
  },
  skeletonChart: {
    height: 160,
    backgroundColor: "#DDE6C8",
    borderRadius: 16,
    marginBottom: 16,
  },
  skeletonBill: {
    height: 60,
    backgroundColor: "#DDE6C8",
    borderRadius: 12,
    marginBottom: 8,
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
  retryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },

  // --- 1. WELCOME SECTION ---
  welcomeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  welcomeGreeting: { fontSize: 16, color: COLORS.primary, opacity: 0.7 },
  welcomeName: { fontSize: 28, fontWeight: "700", color: COLORS.primary },
  welcomeMeta: { alignItems: "flex-end" },
  welcomeDate: { fontSize: 14, fontWeight: "600", color: COLORS.primary },
  welcomeSub: { fontSize: 12, color: COLORS.primary, opacity: 0.6 },

  // --- 2. SUMMARY CARDS ---
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    elevation: 2,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 10,
    color: COLORS.primary,
    opacity: 0.6,
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 2,
  },
  summarySubRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  summarySubValue: { fontSize: 12, fontWeight: "600", marginLeft: 2 },

  // --- 3 & 4. CONSUMPTION TREND ---
  trendSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  trendHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 12,
  },
  trendChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  trendChipText: { fontSize: 12, fontWeight: "600", marginLeft: 4 },
  comparisonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  compLabel: { fontSize: 12, color: COLORS.primary, opacity: 0.6 },
  compVal: { fontSize: 18, fontWeight: "700", color: COLORS.primary },

  // Chart
  chartContainer: { height: 140, position: "relative" },
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
  },
  barWrapper: { flex: 1, alignItems: "center" },
  barTrack: {
    width: "60%",
    backgroundColor: "rgba(29, 46, 27, 0.05)",
    borderRadius: 6,
    overflow: "hidden",
  },
  barFill: { flex: 1, backgroundColor: COLORS.primary, borderRadius: 6 },
  barFillCurrent: {
    backgroundColor: COLORS.primarySupport,
    shadowColor: COLORS.primarySupport,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  barLabel: { marginTop: 6, fontSize: 12, color: COLORS.primary, opacity: 0.6 },
  barLabelCurrent: {
    fontWeight: "700",
    color: COLORS.primarySupport,
    opacity: 1,
  },

  // --- 5. BILL BREAKDOWN ---
  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(29, 46, 27, 0.04)",
  },
  bdLabel: { fontSize: 14, color: COLORS.primary, opacity: 0.7 },
  bdValue: { fontSize: 14, fontWeight: "500", color: COLORS.primary },
  breakdownTotal: {
    borderBottomWidth: 0,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  bdTotalLabel: { fontSize: 16, fontWeight: "700", color: COLORS.primary },
  bdTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primarySupport,
  },

  // --- 6. BILLING HISTORY ---
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primarySupport,
  },
  billCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  billLeft: { flex: 1 },
  billMonth: { fontSize: 16, fontWeight: "600", color: COLORS.primary },
  billDue: { fontSize: 12, color: COLORS.primary, opacity: 0.6 },
  billRight: { alignItems: "flex-end" },
  billAmount: { fontSize: 18, fontWeight: "700", color: COLORS.primarySupport },
  billStatus: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 4,
  },
  billPaid: { backgroundColor: "rgba(70, 132, 50, 0.15)" },
  billUnpaid: { backgroundColor: "rgba(255, 63, 51, 0.15)" },
  billStatusText: { fontSize: 10, fontWeight: "600" },
  billActions: { flexDirection: "row", gap: 12, marginTop: 6 },
  billActionBtn: { padding: 4 },
  billActionText: { fontSize: 18 },

  // --- 7. MONTHLY COMPARISON ---
  compCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  compRowLeft: {
    flex: 1,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(29, 46, 27, 0.08)",
  },
  compTitle: { fontSize: 14, color: COLORS.primary, opacity: 0.6 },
  compBigVal: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    marginVertical: 4,
  },
  compSub: { fontSize: 14, fontWeight: "500" },
  compDivider: { width: 1 },
  compRowRight: { flex: 1, alignItems: "center", justifyContent: "center" },
  compMiniRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginVertical: 2,
  },
  compMiniLabel: { fontSize: 12, color: COLORS.primary, opacity: 0.6 },
  compMiniVal: { fontSize: 14, fontWeight: "600", color: COLORS.primary },

  // --- 8. INSIGHTS ---
  insightRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  insightCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "flex-start",
    elevation: 2,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 4,
  },
  insightDesc: {
    fontSize: 12,
    color: COLORS.primary,
    opacity: 0.7,
    marginTop: 2,
  },

  // --- 9. QUICK ACTIONS ---
  actionRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },

  // --- 10. HIGHLIGHTS ---
  highlightsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  highlightCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    elevation: 2,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.primary,
    marginLeft: 8,
    flex: 1,
  },
});
