// src/screens/ReadingHistoryScreen.js
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Image,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../Components/Colors";

// --- MOCK DATA GENERATORS ---
const generateMockReadings = () => {
  const statuses = ["OCR Verified", "Manually Corrected", "OCR Verified"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  let prev = 1000;

  return months.map((month, index) => {
    const current = prev + Math.floor(Math.random() * 150) + 50;
    const reading = {
      id: index + 1,
      date: `2026-${String(index + 1).padStart(2, "0")}-15`,
      billingMonth: month,
      previousReading: prev,
      currentReading: current,
      unitsConsumed: current - prev,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      submissionTime: `10:${String(30 + index * 5).padStart(2, "0")} AM`,
      isLatest: index === months.length - 1,
      imageUri:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=200&fit=crop",
    };
    prev = current;
    return reading;
  });
};

const MOCK_READINGS = generateMockReadings();

// --- FILTER OPTIONS ---
const STATUSES = ["All", "OCR Verified", "Manually Corrected"];
const MONTHS = ["All", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const YEARS = ["All", "2026", "2025"];

export default function ReadingHistoryScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredReadings, setFilteredReadings] = useState(MOCK_READINGS);
  const [expandedId, setExpandedId] = useState(null);

  // Filter States
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [sortOrder, setSortOrder] = useState("Newest");

  // Filter Modal State
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  // Apply Filters
  const applyFilters = () => {
    let data = MOCK_READINGS;

    if (searchQuery) {
      data = data.filter((item) =>
        item.billingMonth.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (selectedStatus !== "All") {
      data = data.filter((item) => item.status === selectedStatus);
    }
    if (selectedMonth !== "All") {
      data = data.filter((item) => item.billingMonth === selectedMonth);
    }

    // Sort
    data.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
    });

    setFilteredReadings(data);
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedStatus, selectedMonth, selectedYear, sortOrder]);

  // --- RENDER HELPERS ---

  // Summary Card Component
  const SummaryCard = ({ icon, label, value, color }) => (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: color + "20" }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );

  // Filter Selection Modal
  const FilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setFilterModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter & Sort</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterSectionTitle}>Status</Text>
              <View style={styles.filterRow}>
                {STATUSES.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.filterChip,
                      selectedStatus === status && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedStatus(status)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedStatus === status &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterSectionTitle}>Month</Text>
              <View style={styles.filterRow}>
                {MONTHS.map((month) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.filterChip,
                      selectedMonth === month && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedMonth(month)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedMonth === month && styles.filterChipTextActive,
                      ]}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.filterRow}>
                {["Newest", "Oldest"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.filterChip,
                      sortOrder === option && styles.filterChipActive,
                    ]}
                    onPress={() => setSortOrder(option)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        sortOrder === option && styles.filterChipTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.modalApplyButton}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.modalApplyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // Expandable Reading Card with Download Button
  const ReadingCard = ({ item }) => {
    const isExpanded = expandedId === item.id;
    const isLatest = item.isLatest;

    const handleDownloadBill = () => {
      Alert.alert(
        "Download",
        `Downloading bill for ${item.billingMonth} 2026...`,
      );
    };

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
        style={styles.card}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardDate}>{item.date}</Text>
            <Text style={styles.cardMonth}>{item.billingMonth} 2026</Text>
          </View>
          <View style={styles.cardRight}>
            {isLatest && (
              <View style={styles.latestBadge}>
                <Text style={styles.latestBadgeText}>Latest</Text>
              </View>
            )}
            <Text style={styles.cardUnits}>{item.unitsConsumed} kWh</Text>
          </View>
        </View>

        {/* Card Body */}
        <View style={styles.cardBody}>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Reading</Text>
            <Text style={styles.cardValue}>{item.currentReading}</Text>
          </View>
          <View style={styles.cardRow}>
            <Text style={styles.cardLabel}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                item.status === "OCR Verified"
                  ? styles.statusVerified
                  : styles.statusCorrected,
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        </View>

        {/* Expandable Details */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.expandedRow}>
              <Text style={styles.expandedLabel}>Meter Image</Text>
              <Image
                source={{ uri: item.imageUri }}
                style={styles.expandedImage}
              />
            </View>
            <View style={styles.expandedRow}>
              <Text style={styles.expandedLabel}>Previous Reading</Text>
              <Text style={styles.expandedValue}>{item.previousReading}</Text>
            </View>
            <View style={styles.expandedRow}>
              <Text style={styles.expandedLabel}>Units Consumed</Text>
              <Text style={styles.expandedValue}>{item.unitsConsumed} kWh</Text>
            </View>
            <View style={styles.expandedRow}>
              <Text style={styles.expandedLabel}>Submission Time</Text>
              <Text style={styles.expandedValue}>{item.submissionTime}</Text>
            </View>
            <View style={styles.expandedRow}>
              <Text style={styles.expandedLabel}>Confirmation Date</Text>
              <Text style={styles.expandedValue}>{item.date}</Text>
            </View>
          </View>
        )}

        {/* 🆕 Download Bill Button */}
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={handleDownloadBill}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="download"
            size={18}
            color={COLORS.primary}
          />
          <Text style={styles.downloadButtonText}>Download Bill</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // --- UI STATES ---

  // 1. Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.skeletonHeader} />
        <View style={styles.skeletonRow}>
          <View style={styles.skeletonBox} />
          <View style={styles.skeletonBox} />
          <View style={styles.skeletonBox} />
          <View style={styles.skeletonBox} />
        </View>
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonCard} />
        <View style={styles.skeletonCard} />
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
          <Text style={styles.errorTitle}>Failed to Load History</Text>
          <Text style={styles.errorDesc}>
            We couldn't retrieve your reading history. Please try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // 3. Empty State
  if (filteredReadings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <MaterialCommunityIcons
            name="camera-off"
            size={60}
            color={COLORS.primary}
          />
          <Text style={styles.emptyTitle}>No Readings Yet</Text>
          <Text style={styles.emptyDesc}>
            You haven't submitted any meter readings. Take a photo of your meter
            to get started.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // 4. Success State
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Title and Filter Button */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Reading History</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <MaterialCommunityIcons
            name="filter-variant"
            size={22}
            color="#FFFFFF"
          />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <SummaryCard
            icon="counter"
            label="Total Readings"
            value={MOCK_READINGS.length}
            color={COLORS.primarySupport}
          />
          <SummaryCard
            icon="flash"
            label="Latest Reading"
            value={MOCK_READINGS[MOCK_READINGS.length - 1].currentReading}
            color={COLORS.primary}
          />
          <SummaryCard
            icon="chart-bar"
            label="Avg Monthly"
            value="412 kWh"
            color={COLORS.success}
          />
          <SummaryCard
            icon="calendar"
            label="Last Submit"
            value="15 Jun"
            color={COLORS.error}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons
            name="magnify"
            size={24}
            color={COLORS.primary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by month..."
            placeholderTextColor={COLORS.primary + "60"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialCommunityIcons
                name="close-circle"
                size={20}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Readings List */}
        <View style={styles.listContainer}>
          {filteredReadings.map((item) => (
            <ReadingCard key={item.id} item={item} />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Filter Modal */}
      <FilterModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- CONTAINER ---
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

  // --- HEADER ---
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primarySupport,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: COLORS.primarySupport,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },

  // --- LOADING SKELETON ---
  skeletonHeader: {
    height: 50,
    backgroundColor: "#DDE6C8",
    borderRadius: 8,
    margin: 16,
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  skeletonBox: {
    width: "22%",
    height: 80,
    backgroundColor: "#DDE6C8",
    borderRadius: 12,
  },
  skeletonCard: {
    height: 100,
    backgroundColor: "#DDE6C8",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
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

  // --- SUMMARY CARDS ---
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
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

  // --- SEARCH BAR ---
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(29, 46, 27, 0.08)",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 8,
    paddingVertical: 0,
  },

  // --- HISTORY CARDS ---
  listContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardLeft: {
    flex: 1,
  },
  cardDate: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  cardMonth: {
    fontSize: 12,
    color: COLORS.primary,
    opacity: 0.6,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  latestBadge: {
    backgroundColor: COLORS.primarySupport,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
  },
  latestBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  cardUnits: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: COLORS.primary,
    opacity: 0.6,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusVerified: {
    backgroundColor: "rgba(70, 132, 50, 0.15)",
  },
  statusCorrected: {
    backgroundColor: "rgba(255, 222, 66, 0.15)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // --- EXPANDABLE DETAILS ---
  expandedContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(29, 46, 27, 0.06)",
  },
  expandedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  expandedLabel: {
    fontSize: 13,
    color: COLORS.primary,
    opacity: 0.6,
  },
  expandedValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
  },
  expandedImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: "cover",
  },

  // --- DOWNLOAD BUTTON ---
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(29, 46, 27, 0.06)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(29, 46, 27, 0.08)",
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: 6,
  },

  // --- FILTER MODAL ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(29, 46, 27, 0.1)",
  },
  filterChipActive: {
    backgroundColor: COLORS.primarySupport,
    borderColor: COLORS.primarySupport,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.primary,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalApplyButton: {
    backgroundColor: COLORS.primarySupport,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  modalApplyText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
