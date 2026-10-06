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

import ScreenHeader from "../Common/Components/ScreenHeader";
import ScreenBackground from "../Common/Components/ScreenBackground";
import InfoBanner from "../Auth/Components/InfoBanner";
import EmptyState from "../Common/Components/EmptyState";

import CategoryCard from "./Components/CategoryCard";
import TariffRatesSkeleton from "./Components/TariffRatesSkeleton";

import { getCategoryColors } from "./Utils/tariffColors";
import apiClient from "../Config/apiClient";
import { API_ENDPOINTS } from "../Config/ApiEndpoint";

const TariffRatesScreen = ({ navigation, openDrawer }) => {
  // ---------- Data state ----------
  const [tariff, setTariff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // ---------- Entry animations ----------
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(-30)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  // ---------- Fetch on mount ----------
  useEffect(() => {
    let isMounted = true;

    const fetchTariff = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const result = await apiClient.get(API_ENDPOINTS.TARIFF.GET_RATES);

        if (!isMounted) return;

        // ---- Auth errors during logout are expected — ignore silently ----
        if (result.status === 401 || result.status === 422) {
          return;
        }

        if (result.success && result.status === 200 && result.data) {
          setTariff(result.data);
        } else {
          setLoadError(
            result.message || "Could not load tariff rates. Please try again.",
          );
        }
      } catch {
        if (!isMounted) return;
        setLoadError("Could not load tariff rates. Please try again.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchTariff();

    return () => {
      isMounted = false;
    };
  }, []);

  // ---------- Entry animation after data lands ----------
  useEffect(() => {
    if (!tariff) return;

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
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [tariff, headerOpacity, headerTranslateY, contentOpacity]);

  // ---------- Loading ----------
  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <ScreenBackground />
        <TariffRatesSkeleton />
      </SafeAreaView>
    );
  }

  // ---------- No data ----------
  if (!tariff) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.background}
        />
        <ScreenBackground />
        <View style={styles.container}>
          <ScreenHeader
            title="Tariff Rates"
            subtitle="Latest electricity pricing"
            onMenuPress={openDrawer}
          />
          <EmptyState
            icon="pricetags-outline"
            title="No tariff data"
            message={loadError || "We couldn't load the tariff rates."}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Build categories ----------
  const categories = [
    { key: "lifeline", slabs: tariff.lifeline || [] },
    { key: "protected", slabs: tariff.protected || [] },
    { key: "unprotected", slabs: tariff.unprotected || [] },
  ].filter((c) => c.slabs.length > 0);

  // ---------- Full screen ----------
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScreenBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          style={{
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          }}
        >
          <ScreenHeader
            title="Tariff Rates"
            subtitle="Latest electricity pricing"
            onMenuPress={openDrawer}
          />
        </Animated.View>

        {/* Error banner (non-blocking) */}
        {loadError ? (
          <View style={styles.bannerWrap}>
            <InfoBanner
              type="error"
              message={loadError}
              onHide={() => setLoadError("")}
            />
          </View>
        ) : null}

        {/* Category cards */}
        <Animated.View style={{ opacity: contentOpacity }}>
          {categories.map((c) => {
            const colors = getCategoryColors(c.key);
            return (
              <CategoryCard
                key={c.key}
                categoryKey={c.key}
                colors={colors}
                slabs={c.slabs}
              />
            );
          })}
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
  bannerWrap: {
    marginBottom: SPACING.sm,
  },
});

export default TariffRatesScreen;
