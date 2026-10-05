import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
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

import InfoBanner from "../Auth/Components/InfoBanner";
import PrimaryButton from "../Common/Components/PrimaryButton";
import ScreenBackground from "../Common/Components/ScreenBackground";
import BottomSheetModal from "../Common/Components/BottomSheetModal";
import ConfirmDialog from "../Common/Components/ConfirmDialog";
import FilterButton from "./Components/FilterButton";
import EmptyState from "../Common/Components/EmptyState";
import ScreenHeader from "../Common/Components/ScreenHeader";
import ReadingsSkeleton from "./Components/ReadingsSkeleton";

import ReadingCard from "./Components/ReadingCard";
import MonthSectionHeader from "./Components/MonthSectionHeader";
import {
  groupReadingsByMonth,
  MONTH_OPTIONS,
  YEARS,
  STATUS_OPTIONS,
  formatReadingDate,
  formatCurrency,
} from "./Utils/formatMonthYear";
import useCountUp from "../Common/Hooks/useCountUp";

import apiClient from "../Config/apiClient";
import { API_ENDPOINTS } from "../Config/ApiEndpoint";

const ReadingsScreen = ({ navigation, openDrawer }) => {
  // ---------- Data ----------
  const [readings, setReadings] = useState([]);
  const [isLoadingReadings, setIsLoadingReadings] = useState(true);
  const [loadError, setLoadError] = useState("");

  // ---------- Filter state ----------
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftMonth, setDraftMonth] = useState(null);
  const [draftYear, setDraftYear] = useState(null);
  const [draftStatus, setDraftStatus] = useState(null);

  const [appliedMonth, setAppliedMonth] = useState(null);
  const [appliedYear, setAppliedYear] = useState(null);
  const [appliedStatus, setAppliedStatus] = useState(null);

  const [banner, setBanner] = useState({ type: null, message: "" });

  // ---------- Delete confirmation ----------
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ---------- Entry animations ----------
  const headerTranslateY = useRef(new Animated.Value(-30)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(badgeOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(listOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerTranslateY, headerOpacity, badgeOpacity, listOpacity]);

  // ---------- Fetch readings on mount ----------
  useEffect(() => {
    let isMounted = true;

    const fetchReadings = async () => {
      setIsLoadingReadings(true);
      setLoadError("");

      try {
        const result = await apiClient.get(API_ENDPOINTS.READINGS.GET_ALL);

        if (!isMounted) return;

        if (result.success && Array.isArray(result.data)) {
          setReadings(result.data);
        } else if (result.success && !result.data) {
          setReadings([]);
        } else {
          setLoadError(
            result.message || "Could not load your readings. Please try again.",
          );
          setReadings([]);
        }
      } catch {
        if (!isMounted) return;
        setLoadError("Could not load your readings. Please try again.");
        setReadings([]);
      } finally {
        if (isMounted) setIsLoadingReadings(false);
      }
    };

    fetchReadings();

    return () => {
      isMounted = false;
    };
  }, []);

  // ---------- Filter sheet ----------
  const handleOpenFilter = () => {
    setDraftMonth(appliedMonth);
    setDraftYear(appliedYear);
    setDraftStatus(appliedStatus);
    setIsFilterOpen(true);
  };

  const handleApplyFilter = () => {
    const noneSelected = !draftMonth && !draftYear && !draftStatus;
    if (noneSelected) {
      setBanner({
        type: "error",
        message: "Select at least one filter to apply.",
      });
      return;
    }
    setAppliedMonth(draftMonth);
    setAppliedYear(draftYear);
    setAppliedStatus(draftStatus);
    setIsFilterOpen(false);
    setBanner(null);
  };

  const handleClearDraft = () => {
    setDraftMonth(null);
    setDraftYear(null);
    setDraftStatus(null);
  };

  const handleClearApplied = () => {
    setAppliedMonth(null);
    setAppliedYear(null);
    setAppliedStatus(null);
    setBanner(null);
  };

  // ---------- Derived ----------
  const activeFilterCount = [appliedMonth, appliedYear, appliedStatus].filter(
    (v) => v != null,
  ).length;

  const isFilterActive = activeFilterCount > 0;

  const visibleReadings = useMemo(() => {
    if (!isFilterActive) return readings;

    return readings.filter((r) => {
      const d = new Date(r.createdAt);
      if (appliedMonth != null && d.getMonth() + 1 !== appliedMonth)
        return false;
      if (appliedYear != null && d.getFullYear() !== appliedYear) return false;
      if (appliedStatus != null && r.status !== appliedStatus) return false;
      return true;
    });
  }, [readings, isFilterActive, appliedMonth, appliedYear, appliedStatus]);

  const sections = useMemo(
    () =>
      groupReadingsByMonth(visibleReadings).map((g) => ({
        title: g.label,
        count: g.data.length,
        data: g.data,
      })),
    [visibleReadings],
  );

  // ---------- This-month units (from the newest section) ----------
  const thisMonthUnits = useMemo(() => {
    const latest = sections[0]?.data ?? [];
    if (latest.length === 0) return 0;
    return Math.max(...latest.map((r) => r.consumedUnits ?? 0), 0);
  }, [sections]);

  // Animated count for the badge
  const animatedThisMonthUnits = useCountUp(thisMonthUnits, 2400);

  const handleReadingPress = (reading) => {
    navigation?.navigate("SingleReadingScreen", {
      readingDocId: reading.docId,
    });
  };

  const handleAddReading = () => {
    navigation?.navigate("BillCalculationScreen");
  };

  // ---------- Delete flow ----------
  const handleDeletePress = (reading) => {
    setPendingDelete(reading);
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setPendingDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete?.docId) return;

    setIsDeleting(true);

    try {
      const result = await apiClient.delete(
        API_ENDPOINTS.READINGS.DELETE(pendingDelete.docId),
      );

      if (!result.success) {
        setBanner({
          type: "error",
          message: result.message || "Could not delete the reading.",
        });
        setIsDeleting(false);
        setPendingDelete(null);
        return;
      }

      setReadings((prev) =>
        prev.filter((r) => r.docId !== pendingDelete.docId),
      );

      setBanner({
        type: "success",
        message: "Reading deleted successfully.",
      });
      setPendingDelete(null);
    } catch {
      setBanner({
        type: "error",
        message: "Could not delete the reading. Please try again.",
      });
      setPendingDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // ---------- Loading state — skeleton ----------
  if (isLoadingReadings) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <ScreenBackground />
        <ReadingsSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScreenBackground />

      <View style={styles.container}>
        {/* ---------- Header ---------- */}
        <Animated.View
          style={{
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          }}
        >
          <ScreenHeader
            title="Readings"
            subtitle="Your monthly meter readings"
            onMenuPress={openDrawer}
            actionIcon="add"
            actionLabel="Add"
            onAction={handleAddReading}
          />
        </Animated.View>

        {/* ---------- This month units badge ---------- */}
        <Animated.View style={[styles.badgeWrap, { opacity: badgeOpacity }]}>
          <View style={styles.monthBadge}>
            <View style={styles.monthBadgeIcon}>
              <Ionicons
                name="speedometer-outline"
                size={20}
                color={COLORS.white}
              />
            </View>

            <View style={styles.monthBadgeText}>
              <Text style={styles.monthBadgeLabel}>This month</Text>
              <Text style={styles.monthBadgeHint}>Units consumed</Text>
            </View>

            <View style={styles.monthBadgeValueWrap}>
              <Text style={styles.monthBadgeValue}>
                {animatedThisMonthUnits}
              </Text>
              <Text style={styles.monthBadgeUnit}>kWh</Text>
            </View>
          </View>
        </Animated.View>

        {/* ---------- Filter row ---------- */}
        <View style={styles.filterRow}>
          <FilterButton
            onPress={handleOpenFilter}
            activeCount={activeFilterCount}
          />
          {isFilterActive ? (
            <TouchableOpacity
              onPress={handleClearApplied}
              activeOpacity={0.7}
              style={styles.clearChip}
            >
              <Ionicons name="close-circle" size={16} color={COLORS.error} />
              <Text style={styles.clearChipText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ---------- Banner ---------- */}
        <View style={styles.bannerWrap}>
          <InfoBanner
            type={loadError && readings.length === 0 ? "error" : banner?.type}
            message={
              loadError && readings.length === 0 ? loadError : banner?.message
            }
            onHide={() => {
              setBanner({ type: null, message: "" });
              if (readings.length === 0) setLoadError("");
            }}
          />
        </View>

        {/* ---------- Readings list ---------- */}
        <Animated.View style={{ flex: 1, opacity: listOpacity }}>
          {sections.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="No readings found"
              message={
                isFilterActive
                  ? "Try changing or clearing the filters."
                  : "Your meter readings will appear here once you add one."
              }
            />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            >
              {sections.map((section) => (
                <View key={section.title} style={styles.sectionCard}>
                  <MonthSectionHeader
                    label={section.title}
                    count={section.count}
                  />

                  <View style={styles.sectionBody}>
                    {section.data.map((reading, index) => (
                      <ReadingCard
                        key={reading.docId || `${reading.createdAt}-${index}`}
                        reading={reading}
                        onPress={handleReadingPress}
                        onDelete={handleDeletePress}
                        isLast={index === section.data.length - 1}
                      />
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </Animated.View>
      </View>

      {/* ---------- Delete confirmation dialog ---------- */}
      <ConfirmDialog
        visible={!!pendingDelete}
        title="Delete this reading?"
        message="This action cannot be undone."
        icon="trash"
        iconColor={COLORS.error}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor={COLORS.error}
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      >
        {pendingDelete ? (
          <View style={styles.deleteDetails}>
            <View style={styles.deleteDetailRow}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.deleteDetailLabel}>Date</Text>
              <Text style={styles.deleteDetailValue}>
                {formatReadingDate(pendingDelete.createdAt)}
              </Text>
            </View>

            <View style={styles.deleteDetailRow}>
              <Ionicons name="flash-outline" size={16} color={COLORS.primary} />
              <Text style={styles.deleteDetailLabel}>Units</Text>
              <Text style={styles.deleteDetailValue}>
                {pendingDelete.consumedUnits} kWh
              </Text>
            </View>

            <View style={styles.deleteDetailRow}>
              <Ionicons
                name="receipt-outline"
                size={16}
                color={COLORS.primary}
              />
              <Text style={styles.deleteDetailLabel}>Bill</Text>
              <Text style={styles.deleteDetailValue}>
                {formatCurrency(pendingDelete.totalBill)}
              </Text>
            </View>
          </View>
        ) : null}
      </ConfirmDialog>

      {/* ---------- Filter sheet ---------- */}
      <BottomSheetModal
        visible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Readings"
        subtitle="Select any combination of filters."
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetContent}
        >
          <Text style={styles.groupLabel}>Month</Text>
          <View style={styles.chipsWrap}>
            {MONTH_OPTIONS.map((m) => (
              <TouchableOpacity
                key={m.value}
                onPress={() =>
                  setDraftMonth(draftMonth === m.value ? null : m.value)
                }
                activeOpacity={0.7}
                style={[
                  styles.chip,
                  draftMonth === m.value && styles.chipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    draftMonth === m.value && styles.chipTextSelected,
                  ]}
                >
                  {m.label.slice(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.groupLabel, { marginTop: SPACING.lg }]}>
            Year
          </Text>
          <View style={styles.chipsWrap}>
            {YEARS.map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => setDraftYear(draftYear === y ? null : y)}
                activeOpacity={0.7}
                style={[styles.chip, draftYear === y && styles.chipSelected]}
              >
                <Text
                  style={[
                    styles.chipText,
                    draftYear === y && styles.chipTextSelected,
                  ]}
                >
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.groupLabel, { marginTop: SPACING.lg }]}>
            Status
          </Text>
          <View style={styles.chipsWrap}>
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setDraftStatus(draftStatus === s ? null : s)}
                activeOpacity={0.7}
                style={[styles.chip, draftStatus === s && styles.chipSelected]}
              >
                <Text
                  style={[
                    styles.chipText,
                    draftStatus === s && styles.chipTextSelected,
                  ]}
                >
                  {s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.sheetActions}>
            <TouchableOpacity
              onPress={handleClearDraft}
              activeOpacity={0.7}
              style={styles.clearSheetButton}
            >
              <Text style={styles.clearSheetText}>Clear</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title="Apply Filters"
                onPress={handleApplyFilter}
                iconName="checkmark-outline"
              />
            </View>
          </View>
        </ScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },

  // ---------- This month badge ----------
  badgeWrap: {
    marginBottom: SPACING.md,
  },
  monthBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  monthBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
    alignItems: "center",
    justifyContent: "center",
  },
  monthBadgeText: {
    flex: 1,
  },
  monthBadgeLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    letterSpacing: -0.2,
  },
  monthBadgeHint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.white,
    opacity: 0.85,
    marginTop: 2,
  },
  monthBadgeValueWrap: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  monthBadgeValue: {
    fontSize: 32,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    letterSpacing: -0.5,
    fontVariant: ["tabular-nums"],
  },
  monthBadgeUnit: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.white,
    opacity: 0.85,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },

  // ---------- Filter row ----------
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  clearChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: "#FDECEA",
  },
  clearChipText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.error,
  },
  bannerWrap: {
    marginBottom: SPACING.sm,
  },
  listContent: {
    paddingBottom: SPACING.xxxl,
  },

  // ---------- Section card ----------
  sectionCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  sectionBody: {
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },

  // ---------- Delete dialog details ----------
  deleteDetails: {
    backgroundColor: COLORS.primaryFade,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  deleteDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  deleteDetailLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  deleteDetailValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },

  // Sheet
  sheetContent: {
    paddingBottom: SPACING.md,
  },
  groupLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    letterSpacing: 0.3,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.xs,
  },
  chip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.circle,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
  },
  chipTextSelected: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  sheetActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  clearSheetButton: {
    paddingHorizontal: SPACING.lg,
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  clearSheetText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textSecondary,
  },
});

export default ReadingsScreen;
