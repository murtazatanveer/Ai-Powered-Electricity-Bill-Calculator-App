import { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  SafeAreaView,
} from "react-native";

import { COLORS, SPACING } from "../Theme/colors";

import HeaderWithBack from "../Common/Components/HeaderWithBack";
import ScreenBackground from "../Common/Components/ScreenBackground";
import SectionCard from "../Common/Components/SectionCard";
import EmptyState from "../Common/Components/EmptyState";

import ReadingStatusCard from "./Components/ReadingStatusCard";
import SlabBreakdownCard from "../Common/Components/SlabBreakdownCard";
import BillBreakdownCard from "../Common/Components/BillBreakdownCard";
import SingleReadingSkeleton from "./Components/SingleReadingSkeleton";

import apiClient from "../Config/apiClient";
import { API_ENDPOINTS } from "../Config/ApiEndpoint";

const SingleReadingScreen = ({ navigation, route }) => {
  // ---------- Route param ----------
  const readingDocId = route?.params?.readingDocId ?? null;

  // ---------- Data state ----------
  const [reading, setReading] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // ---------- Entry animations ----------
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(20)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const sectionsOpacity = useRef(new Animated.Value(0)).current;

  // ---------- Fetch the single reading on mount ----------
  useEffect(() => {
    if (!readingDocId) {
      setIsLoading(false);
      setLoadError("No reading reference was provided.");
      return;
    }

    let isMounted = true;

    const fetchReading = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const result = await apiClient.get(
          API_ENDPOINTS.READINGS.GET_BY_ID(readingDocId),
        );

        if (!isMounted) return;

        if (result.success && result.status === 200 && result.data) {
          setReading(result.data);
        } else {
          setLoadError(
            result.message || "Could not load this reading. Please try again.",
          );
        }
      } catch {
        if (!isMounted) return;
        setLoadError("Could not load this reading. Please try again.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchReading();

    return () => {
      isMounted = false;
    };
  }, [readingDocId]);

  // ---------- Entry animation (runs when data lands) ----------
  useEffect(() => {
    if (!reading) return;

    Animated.sequence([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(heroTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(sectionsOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [reading, headerOpacity, heroTranslateY, heroOpacity, sectionsOpacity]);

  const handleBack = () => {
    if (navigation?.goBack) navigation.goBack();
    else navigation?.navigate?.("ReadingsScreen");
  };

  // ============================================================
  // RENDER PRIORITY
  //   1. Still loading → Skeleton
  //   2. Error or no data → EmptyState with header
  //   3. Data ready → Full screen
  // ============================================================

  // ---------- 1. Skeleton ----------
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <ScreenBackground />
        <SingleReadingSkeleton />
      </SafeAreaView>
    );
  }

  // ---------- 2. Error / no data ----------
  if (!reading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <ScreenBackground />
        <View style={styles.container}>
          <HeaderWithBack
            title="Reading Detail"
            subtitle="A single meter reading"
            onBack={handleBack}
          />
          <EmptyState
            icon="document-text-outline"
            title="No reading data"
            message={loadError || "We couldn't load this reading."}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ---------- 3. Full screen ----------
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScreenBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ---------- Header with back ---------- */}
        <Animated.View style={{ opacity: headerOpacity }}>
          <HeaderWithBack
            title="Reading Detail"
            subtitle="A single meter reading"
            onBack={handleBack}
          />
        </Animated.View>

        {/* ---------- Hero card ---------- */}
        <Animated.View
          style={{
            opacity: heroOpacity,
            transform: [{ translateY: heroTranslateY }],
          }}
        >
          <ReadingStatusCard reading={reading} />
        </Animated.View>

        {/* ---------- Slab + bill breakdown ---------- */}
        <Animated.View style={{ opacity: sectionsOpacity }}>
          <SectionCard title="Slab-wise Energy Cost">
            <SlabBreakdownCard slabs={reading.slabWiseEnergyCost} />
          </SectionCard>

          <SectionCard title="Bill Breakdown">
            <BillBreakdownCard breakdown={reading.billBreakDown} />
          </SectionCard>
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
});

export default SingleReadingScreen;
