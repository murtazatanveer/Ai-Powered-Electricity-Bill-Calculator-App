import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../Theme/colors";

import FormInput from "../Auth/Components/FormInput";
import InfoBanner from "../Auth/Components/InfoBanner";
import PrimaryButton from "../Common/Components/PrimaryButton";
import ScreenBackground from "../Common/Components/ScreenBackground";
import HeaderWithBack from "../Common/Components/HeaderWithBack";
import SectionCard from "../Common/Components/SectionCard";
import ErrorPopup from "../Common/Components/ErrorPopup";
import InfoPopup from "../Common/Components/InfoPopup";

import BillResultCard from "./Components/BillResultCard";
import SlabBreakdownCard from "../Common/Components/SlabBreakdownCard";
import BillBreakdownCard from "../Common/Components/BillBreakdownCard";

import { describeStatusChange } from "./Utils/statusChange";
import apiClient from "../Config/apiClient";
import { API_ENDPOINTS } from "../Config/ApiEndpoint";

const BillCalculationScreen = ({ navigation }) => {
  // ---------- Form state ----------
  const [units, setUnits] = useState("");
  const [fpa, setFpa] = useState("");
  const [qta, setQta] = useState("");

  const [errors, setErrors] = useState({ units: "", fpa: "", qta: "" });
  const [banner, setBanner] = useState({ type: null, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [bill, setBill] = useState(null);

  // ---------- Error popup (backend errors) ----------
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

  // ---------- Status change popup ----------
  const [statusPopup, setStatusPopup] = useState({
    visible: false,
    title: "",
    message: "",
    isDowngrade: false,
    from: "",
    to: "",
  });

  const closeStatusPopup = () => {
    setStatusPopup({
      visible: false,
      title: "",
      message: "",
      isDowngrade: false,
      from: "",
      to: "",
    });
  };

  // ---------- Entry animations ----------
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(20)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerOpacity, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [headerOpacity, formTranslateY, formOpacity]);

  // ---------- Validation ----------
  const validate = () => {
    const next = { units: "", fpa: "", qta: "" };

    if (!units.trim()) next.units = "Units are required";
    else {
      const n = Number(units);
      if (!Number.isFinite(n)) next.units = "Enter a valid number";
      else if (n < 0) next.units = "Units cannot be negative";
      else if (!Number.isInteger(n))
        next.units = "Units must be a whole number";
    }

    if (fpa.trim() && Number.isNaN(Number(fpa)))
      next.fpa = "Enter a valid number";
    if (qta.trim() && Number.isNaN(Number(qta)))
      next.qta = "Enter a valid number";

    return next;
  };

  const clearField = (field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));

  const clearBanner = () =>
    setBanner((prev) => (prev.type ? { type: null, message: "" } : prev));

  const handleUnitsChange = (v) => {
    setUnits(v.replace(/[^0-9]/g, ""));
    clearField("units");
    clearBanner();
  };

  const handleFpaChange = (v) => {
    setFpa(v.replace(/[^0-9.]/g, ""));
    clearField("fpa");
    clearBanner();
  };

  const handleQtaChange = (v) => {
    setQta(v.replace(/[^0-9.]/g, ""));
    clearField("qta");
    clearBanner();
  };

  // ---------- Submit ----------
  const handleCalculate = async () => {
    const nextErrors = validate();
    const hasErrors = Object.values(nextErrors).some(Boolean);

    if (hasErrors) {
      setErrors(nextErrors);
      setBanner({
        type: "error",
        message: "Please fix the highlighted fields.",
      });
      return;
    }

    setErrors({ units: "", fpa: "", qta: "" });
    setIsLoading(true);
    setBanner({ type: null, message: "" });
    setBill(null);

    try {
      const result = await apiClient.post(API_ENDPOINTS.BILL.CALCULATE, {
        units: Number(units),
        FPA: Number(fpa) || 0,
        QTA: Number(qta) || 0,
      });

      setIsLoading(false);

      // ---------- Error → ErrorPopup ----------
      if (!result.success) {
        let title = "Request Failed";
        let message = result.message;

        if (result.status === 401) {
          title = "Session Expired";
          message = "Your session has expired. Please sign in again.";
        } else if (result.status === 409) {
          title = "Setup Incomplete";
          message =
            message ||
            "Please complete your bill details before calculating a bill.";
        } else if (result.status === 422) {
          title = "Invalid Reading";
          message = message || "The reading you entered is not valid.";
        } else if (result.status === 500) {
          title = "Server Error";
          message = message || "Something went wrong on the server.";
        } else if (result.status === 0) {
          title = "Network Error";
          message = "Network error. Please check your internet connection.";
        }

        showErrorPopup(title, message);
        return;
      }

      // ---------- Success → display bill on this screen ----------
      setBill(result.data);

      // ---------- Status change popup ----------
      const change = describeStatusChange(
        result.data?.statusUpdated,
        result.data?.previousStatus,
        result.data?.status,
      );

      if (change.changed) {
        setStatusPopup({
          visible: true,
          title: change.title,
          message: change.message,
          isDowngrade: change.isDowngrade,
          from: result.data.previousStatus,
          to: result.data.status,
        });
      }
    } catch {
      setIsLoading(false);
      showErrorPopup(
        "Unexpected Error",
        "Something went wrong. Please try again.",
      );
    }
  };

  const handleBack = () => {
    if (navigation?.goBack) navigation.goBack();
    else navigation?.navigate?.("ReadingsScreen");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScreenBackground />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contentWrap}>
            {/* ---------- Header with back ---------- */}
            <Animated.View style={{ opacity: headerOpacity }}>
              <HeaderWithBack
                title="Add Reading"
                subtitle="Enter your meter units to calculate the bill."
                onBack={handleBack}
              />
            </Animated.View>

            {/* ---------- Form ---------- */}
            <Animated.View
              style={{
                opacity: formOpacity,
                transform: [{ translateY: formTranslateY }],
              }}
            >
              <SectionCard title="Meter Reading">
                <InfoBanner
                  type={banner.type}
                  message={banner.message}
                  onHide={() => setBanner({ type: null, message: "" })}
                />

                <FormInput
                  label="Units Consumed"
                  value={units}
                  onChangeText={handleUnitsChange}
                  placeholder="e.g. 450"
                  iconName="speedometer-outline"
                  error={errors.units}
                  keyboardType="number-pad"
                  editable={!isLoading}
                />

                <FormInput
                  label="FPA (Rs/unit, optional)"
                  value={fpa}
                  onChangeText={handleFpaChange}
                  placeholder="Fuel Price Adjustment"
                  iconName="flame-outline"
                  error={errors.fpa}
                  keyboardType="decimal-pad"
                  editable={!isLoading}
                />

                <FormInput
                  label="QTA (Rs/unit, optional)"
                  value={qta}
                  onChangeText={handleQtaChange}
                  placeholder="Quarterly Tariff Adjustment"
                  iconName="options-outline"
                  error={errors.qta}
                  keyboardType="decimal-pad"
                  editable={!isLoading}
                />

                <PrimaryButton
                  title="Calculate Bill"
                  onPress={handleCalculate}
                  iconName="calculator-outline"
                  loading={isLoading}
                  style={styles.submitButton}
                />
              </SectionCard>

              {/* ---------- Bill Result ---------- */}
              {bill ? (
                <>
                  <BillResultCard bill={bill} />

                  <View style={styles.detailsLabelRow}>
                    <Ionicons
                      name="receipt-outline"
                      size={16}
                      color={COLORS.primary}
                    />
                    <Text style={styles.detailsLabel}>Bill Details</Text>
                  </View>

                  <SectionCard title="Slab-wise Energy Cost">
                    <SlabBreakdownCard slabs={bill.slabWiseEnergyCost} />
                  </SectionCard>

                  <SectionCard title="Bill Breakdown">
                    <BillBreakdownCard breakdown={bill.billBreakDown} />
                  </SectionCard>
                </>
              ) : null}
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---------- Backend error popup ---------- */}
      <ErrorPopup
        visible={errorPopup.visible}
        title={errorPopup.title}
        message={errorPopup.message}
        onClose={closeErrorPopup}
      />

      {/* ---------- Status change popup ---------- */}
      <InfoPopup
        visible={statusPopup.visible}
        icon={statusPopup.isDowngrade ? "trending-up" : "trending-down"}
        iconColor={statusPopup.isDowngrade ? COLORS.warning : COLORS.success}
        title={statusPopup.title}
        message={statusPopup.message}
        buttonTitle="Got it"
        onClose={closeStatusPopup}
      >
        {statusPopup.visible ? (
          <View style={styles.statusChangePanel}>
            <View style={styles.statusChangeRow}>
              <Text style={styles.statusChangeLabel}>Previous</Text>
              <Text style={styles.statusChangeValue}>{statusPopup.from}</Text>
            </View>

            <View style={styles.statusChangeDivider} />

            <View style={styles.statusChangeRow}>
              <Text style={styles.statusChangeLabel}>New status</Text>
              <Text
                style={[
                  styles.statusChangeValue,
                  {
                    color: statusPopup.isDowngrade
                      ? COLORS.warning
                      : COLORS.success,
                  },
                ]}
              >
                {statusPopup.to}
              </Text>
            </View>
          </View>
        ) : null}
      </InfoPopup>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  contentWrap: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
  },
  submitButton: {
    marginTop: SPACING.xs,
  },
  detailsLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xxs,
  },
  detailsLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  // ---------- Status change panel ----------
  statusChangePanel: {
    backgroundColor: COLORS.primaryFade,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primaryLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
  },
  statusChangeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  statusChangeDivider: {
    height: 1,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.6,
    marginVertical: 2,
  },
  statusChangeLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  statusChangeValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

export default BillCalculationScreen;
