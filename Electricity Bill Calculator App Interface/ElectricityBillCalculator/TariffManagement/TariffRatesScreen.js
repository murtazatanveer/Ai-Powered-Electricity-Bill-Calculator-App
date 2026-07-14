// src/screens/TariffRatesScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../Components/Colors";

// --- MOCK DATA (Realistic Pakistani Tariffs) ---
const MOCK_TARIFFS = [
  {
    id: "1",
    category: "Residential",
    provider: "PESCO",
    district: "Peshawar",
    protected: true,
    type: "Protected",
    slab: "1 - 100 kWh",
    rate: 12.5,
    lastUpdated: "2026-07-12",
  },
  {
    id: "2",
    category: "Residential",
    provider: "PESCO",
    district: "Peshawar",
    protected: false,
    type: "Unprotected",
    slab: "101 - 200 kWh",
    rate: 18.75,
    lastUpdated: "2026-07-12",
  },
  {
    id: "3",
    category: "Commercial",
    provider: "LESCO",
    district: "Lahore",
    protected: false,
    type: "General",
    slab: "0 - 500 kWh",
    rate: 22.4,
    lastUpdated: "2026-07-11",
  },
  {
    id: "4",
    category: "Industrial",
    provider: "IESCO",
    district: "Islamabad",
    protected: false,
    type: "Heavy",
    slab: "1 - 1000 kWh",
    rate: 28.0,
    lastUpdated: "2026-07-10",
  },
  {
    id: "5",
    category: "Agricultural",
    provider: "GEPCO",
    district: "Gujranwala",
    protected: true,
    type: "Subsidized",
    slab: "1 - 500 kWh",
    rate: 8.5,
    lastUpdated: "2026-07-12",
  },
  {
    id: "6",
    category: "Residential",
    provider: "MEPCO",
    district: "Multan",
    protected: false,
    type: "Standard",
    slab: "1 - 150 kWh",
    rate: 14.2,
    lastUpdated: "2026-07-09",
  },
];

// --- FILTER OPTIONS ---
const CATEGORIES = [
  "All",
  "Residential",
  "Commercial",
  "Industrial",
  "Agricultural",
];
const PROVIDERS = [
  "All",
  "PESCO",
  "LESCO",
  "IESCO",
  "FESCO",
  "GEPCO",
  "MEPCO",
  "HESCO",
  "QESCO",
  "SEPCO",
];
const DISTRICTS = [
  "All",
  "Peshawar",
  "Lahore",
  "Islamabad",
  "Faisalabad",
  "Gujranwala",
  "Multan",
  "Hyderabad",
  "Quetta",
];

export default function TariffRatesScreen({ navigation }) {
  // --- States ---
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProvider, setSelectedProvider] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [filteredTariffs, setFilteredTariffs] = useState(MOCK_TARIFFS);
  const [error, setError] = useState(false);

  // --- My Tariff Modal State ---
  const [myTariffVisible, setMyTariffVisible] = useState(false);

  // --- Filter Modal States ---
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [providerModalVisible, setProviderModalVisible] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);

  // --- Simulation: Load Data ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setFilteredTariffs(MOCK_TARIFFS);
    }, 1500); // Increased slightly to show the skeleton beautifully
    return () => clearTimeout(timer);
  }, []);

  // --- Filter Logic ---
  const applyFilters = () => {
    let data = MOCK_TARIFFS;

    if (searchQuery) {
      data = data.filter(
        (item) =>
          item.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.district.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (selectedCategory !== "All") {
      data = data.filter((item) => item.category === selectedCategory);
    }
    if (selectedProvider !== "All") {
      data = data.filter((item) => item.provider === selectedProvider);
    }
    if (selectedDistrict !== "All") {
      data = data.filter((item) => item.district === selectedDistrict);
    }

    setFilteredTariffs(data);
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, selectedProvider, selectedDistrict]);

  // --- Render Helper Components ---

  // 📌 Modern Dropdown Selector
  const FilterSelector = ({ label, value, onPress, icon }) => (
    <TouchableOpacity style={styles.selectorButton} onPress={onPress}>
      <View style={styles.selectorContent}>
        <MaterialCommunityIcons name={icon} size={18} color={COLORS.primary} />
        <Text style={styles.selectorLabel}>{label}</Text>
        <Text style={styles.selectorValue}>{value}</Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-down"
        size={20}
        color={COLORS.primary}
      />
    </TouchableOpacity>
  );

  // 📌 Reusable Selection Modal
  const SelectionModal = ({
    visible,
    onClose,
    options,
    selectedValue,
    onSelect,
    title,
  }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.modalItem,
                    selectedValue === option && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      selectedValue === option && styles.modalItemTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {selectedValue === option && (
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color={COLORS.primarySupport}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  // 📌 My Tariff Card (Mock Data for Residential / PESCO / Peshawar)
  const MyTariffCard = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={myTariffVisible}
      onRequestClose={() => setMyTariffVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setMyTariffVisible(false)}>
        <View style={styles.myTariffOverlay}>
          <View style={styles.myTariffCard}>
            <View style={styles.myTariffHeader}>
              <MaterialCommunityIcons
                name="tag"
                size={24}
                color={COLORS.primarySupport}
              />
              <Text style={styles.myTariffTitle}>My Tariff Rates</Text>
              <TouchableOpacity onPress={() => setMyTariffVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.myTariffBody}>
              <View style={styles.myTariffRow}>
                <Text style={styles.myTariffLabel}>Category</Text>
                <Text style={styles.myTariffValue}>Residential</Text>
              </View>
              <View style={styles.myTariffRow}>
                <Text style={styles.myTariffLabel}>Provider</Text>
                <Text style={styles.myTariffValue}>PESCO</Text>
              </View>
              <View style={styles.myTariffRow}>
                <Text style={styles.myTariffLabel}>District</Text>
                <Text style={styles.myTariffValue}>Peshawar</Text>
              </View>
              <View style={styles.myTariffRow}>
                <Text style={styles.myTariffLabel}>Status</Text>
                <View style={styles.myTariffBadge}>
                  <Text style={styles.myTariffBadgeText}>Protected</Text>
                </View>
              </View>
              <View style={styles.myTariffRow}>
                <Text style={styles.myTariffLabel}>Slab Range</Text>
                <Text style={styles.myTariffValue}>1 - 100 kWh</Text>
              </View>
              <View style={[styles.myTariffRow, styles.myTariffTotalRow]}>
                <Text style={styles.myTariffTotalLabel}>Per Unit Rate</Text>
                <Text style={styles.myTariffTotalValue}>PKR 12.50</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.myTariffCloseButton}
              onPress={() => setMyTariffVisible(false)}
            >
              <Text style={styles.myTariffCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const renderTariffCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: COLORS.primarySupport + "20" },
          ]}
        >
          <Text style={styles.categoryBadgeText}>{item.category}</Text>
        </View>
        <MaterialCommunityIcons
          name="lightning-bolt"
          size={20}
          color={COLORS.primarySupport}
        />
      </View>

      <View style={styles.cardRow}>
        <MaterialCommunityIcons
          name="office-building"
          size={16}
          color={COLORS.primary}
        />
        <Text style={styles.cardProvider}>{item.provider}</Text>
        <View style={styles.cardDivider} />
        <MaterialCommunityIcons
          name="map-marker"
          size={16}
          color={COLORS.primary}
        />
        <Text style={styles.cardDistrict}>{item.district}</Text>
      </View>

      <View style={styles.cardDetailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Tariff Type</Text>
          <Text style={styles.detailValue}>{item.type}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Slab Range</Text>
          <Text style={styles.detailValue}>{item.slab}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View
          style={[
            styles.protectedBadge,
            item.protected ? styles.protectedActive : styles.protectedInactive,
          ]}
        >
          <MaterialCommunityIcons
            name={item.protected ? "shield-check" : "shield-off"}
            size={14}
            color={item.protected ? "#FFFFFF" : COLORS.error}
          />
          <Text
            style={[
              styles.protectedText,
              item.protected ? { color: "#FFFFFF" } : { color: COLORS.error },
            ]}
          >
            {item.protected ? "Protected" : "Unprotected"}
          </Text>
        </View>
        <View style={styles.rateContainer}>
          <Text style={styles.rateLabel}>Per Unit</Text>
          <Text style={styles.rateValue}>PKR {item.rate.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.cardFooterMeta}>
        <MaterialCommunityIcons
          name="update"
          size={14}
          color={COLORS.primary}
          opacity={0.5}
        />
        <Text style={styles.lastUpdatedText}>Updated: {item.lastUpdated}</Text>
      </View>
    </View>
  );

  // --- SKELETON LOADING COMPONENT ---
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Skeleton Info Banner */}
          <View style={styles.skeletonBanner} />

          {/* Skeleton Search Bar */}
          <View style={styles.skeletonSearch} />

          {/* Skeleton My Tariff Button */}
          <View style={styles.skeletonMyTariff} />

          {/* Skeleton Filter Selectors */}
          <View style={styles.skeletonFilters}>
            <View style={styles.skeletonSelector} />
            <View style={styles.skeletonSelector} />
            <View style={styles.skeletonSelector} />
          </View>

          {/* Skeleton Results Header */}
          <View style={styles.skeletonResultsHeader} />

          {/* Skeleton Tariff Cards */}
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- UI STATES ---
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={64}
            color={COLORS.error}
          />
          <Text style={styles.errorTitle}>Failed to Load Tariffs</Text>
          <Text style={styles.errorSubtitle}>
            Please check your connection and try again.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setError(false)}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons
            name="database-sync"
            size={20}
            color={COLORS.primarySupport}
          />
          <Text style={styles.infoBannerText}>
            Tariff rates are automatically updated and synchronized by the
            system.
          </Text>
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
            placeholder="Search by Provider or District"
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

        {/* My Tariff Rates Button */}
        <TouchableOpacity
          style={styles.myTariffButton}
          onPress={() => setMyTariffVisible(true)}
        >
          <MaterialCommunityIcons name="account" size={20} color="#FFFFFF" />
          <Text style={styles.myTariffButtonText}>My Tariff Rates</Text>
        </TouchableOpacity>

        {/* Modern Filter Selectors */}
        <View style={styles.filtersContainer}>
          <FilterSelector
            label="Category"
            value={selectedCategory}
            icon="view-grid-outline"
            onPress={() => setCategoryModalVisible(true)}
          />
          <FilterSelector
            label="Provider"
            value={selectedProvider}
            icon="office-building"
            onPress={() => setProviderModalVisible(true)}
          />
          <FilterSelector
            label="District"
            value={selectedDistrict}
            icon="map-marker"
            onPress={() => setDistrictModalVisible(true)}
          />
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredTariffs.length} Tariff
            {filteredTariffs.length !== 1 ? "s" : ""} Found
          </Text>
          <Text style={styles.resultsSub}>
            Last synchronized: Today at 12:00 PM
          </Text>
        </View>

        {/* Tariff Cards List */}
        {filteredTariffs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={64}
              color={COLORS.primary + "40"}
            />
            <Text style={styles.emptyTitle}>No Tariffs Found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filter settings.
            </Text>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedProvider("All");
                setSelectedDistrict("All");
              }}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredTariffs.map((item) => (
              <View key={item.id}>{renderTariffCard({ item })}</View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Selection Modals */}
      <SelectionModal
        visible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        options={CATEGORIES}
        selectedValue={selectedCategory}
        onSelect={setSelectedCategory}
        title="Select Category"
      />
      <SelectionModal
        visible={providerModalVisible}
        onClose={() => setProviderModalVisible(false)}
        options={PROVIDERS}
        selectedValue={selectedProvider}
        onSelect={setSelectedProvider}
        title="Select Provider"
      />
      <SelectionModal
        visible={districtModalVisible}
        onClose={() => setDistrictModalVisible(false)}
        options={DISTRICTS}
        selectedValue={selectedDistrict}
        onSelect={setSelectedDistrict}
        title="Select District"
      />

      {/* My Tariff Modal */}
      <MyTariffCard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  // --- Loading & Error ---
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.primary,
    opacity: 0.6,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    marginTop: 12,
  },
  errorSubtitle: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.6,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
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
  // --- Info Banner ---
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(29, 46, 27, 0.08)",
    marginBottom: 16,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primary,
    opacity: 0.8,
    marginLeft: 8,
  },
  // --- Search Bar ---
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
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 8,
    paddingVertical: 0,
  },
  // --- My Tariff Button ---
  myTariffButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primarySupport,
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: COLORS.primarySupport,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  myTariffButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  // --- Modern Filter Selectors ---
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  selectorButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(29, 46, 27, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  selectorContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    color: COLORS.primary,
    opacity: 0.6,
    marginLeft: 4,
    marginRight: 4,
  },
  selectorValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    flexShrink: 1,
  },
  // --- Selection Modal ---
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
  modalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(29, 46, 27, 0.05)",
  },
  modalItemSelected: {
    backgroundColor: "rgba(70, 132, 50, 0.05)",
  },
  modalItemText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  modalItemTextSelected: {
    fontWeight: "600",
    color: COLORS.primarySupport,
  },
  // --- My Tariff Modal ---
  myTariffOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  myTariffCard: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  myTariffHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  myTariffTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },
  myTariffBody: {
    marginBottom: 20,
  },
  myTariffRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(29, 46, 27, 0.05)",
  },
  myTariffLabel: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.6,
  },
  myTariffValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
  },
  myTariffBadge: {
    backgroundColor: COLORS.primarySupport,
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  myTariffBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  myTariffTotalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  myTariffTotalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  myTariffTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primarySupport,
  },
  myTariffCloseButton: {
    backgroundColor: COLORS.primarySupport,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  myTariffCloseText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // --- Results Header ---
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  resultsSub: {
    fontSize: 12,
    color: COLORS.primary,
    opacity: 0.5,
  },
  // --- Empty State ---
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.5,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: "rgba(29, 46, 27, 0.08)",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  // --- Tariff Card ---
  listContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(29, 46, 27, 0.06)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  categoryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.primarySupport,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardProvider: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginLeft: 6,
  },
  cardDistrict: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.7,
    marginLeft: 6,
  },
  cardDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(29, 46, 27, 0.2)",
    marginHorizontal: 10,
  },
  cardDetailsRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.primary,
    opacity: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.primary,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(29, 46, 27, 0.06)",
  },
  protectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  protectedActive: {
    backgroundColor: COLORS.primarySupport,
  },
  protectedInactive: {
    backgroundColor: "rgba(255, 63, 51, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 63, 51, 0.2)",
  },
  protectedText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  rateContainer: {
    alignItems: "flex-end",
  },
  rateLabel: {
    fontSize: 10,
    color: COLORS.primary,
    opacity: 0.4,
  },
  rateValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primarySupport,
  },
  cardFooterMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(29, 46, 27, 0.04)",
  },
  lastUpdatedText: {
    fontSize: 12,
    color: COLORS.primary,
    opacity: 0.4,
    marginLeft: 4,
  },

  // --- SKELETON LOADING STYLES ---
  skeletonBanner: {
    height: 50,
    backgroundColor: "#DDE6C8",
    borderRadius: 12,
    marginBottom: 16,
  },
  skeletonSearch: {
    height: 50,
    backgroundColor: "#DDE6C8",
    borderRadius: 16,
    marginBottom: 12,
  },
  skeletonMyTariff: {
    height: 50,
    backgroundColor: "#DDE6C8",
    borderRadius: 14,
    marginBottom: 16,
  },
  skeletonFilters: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  skeletonSelector: {
    flex: 1,
    height: 50,
    backgroundColor: "#DDE6C8",
    borderRadius: 14,
  },
  skeletonResultsHeader: {
    height: 40,
    backgroundColor: "#DDE6C8",
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonCard: {
    height: 160,
    backgroundColor: "#DDE6C8",
    borderRadius: 20,
    marginBottom: 16,
  },
});
