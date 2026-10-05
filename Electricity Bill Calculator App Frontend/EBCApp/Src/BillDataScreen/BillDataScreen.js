import { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  SafeAreaView,
} from "react-native";

import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../Theme/colors";

import AuthHeader from "../Auth/Components/AuthHeader";
import InfoBanner from "../Auth/Components/InfoBanner";
import PrimaryButton from "../Common/Components/PrimaryButton";
import ScreenBackground from "../Common/Components/ScreenBackground";
import ErrorPopup from "../Common/Components/ErrorPopup";

import DiscoSelector from "./Components/DiscoSelector";
import StatusSelector from "./Components/StatusSelector";
import PhaseSelector from "./Components/PhaseSelector";
import BillImagePicker from "./Components/BillImagePicker";
import DashboardSkeleton from "../Common/Components/DashboardSkeleton";

import apiClient from "../Config/apiClient";
import { API_ENDPOINTS } from "../Config/ApiEndpoint";
import { validateBillImage, imageToFormPart } from "./Utils/validateBillImage";

const BillDataScreen = ({ navigation }) => {
  // ---------- Selections ----------
  const [selectedDisco, setSelectedDisco] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [billImage, setBillImage] = useState(null);

  // ---------- UI state ----------
  const [errors, setErrors] = useState({
    disco: "",
    status: "",
    phase: "",
    image: "",
  });
  const [banner, setBanner] = useState({ type: null, message: "" });
  const [isLoading, setIsLoading] = useState(false);

  // ---------- Mount-time existence check ----------
  const [isCheckingExistence, setIsCheckingExistence] = useState(true);

  // ---------- Error popup (backend errors only) ----------
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

  // ---------- Page animations ----------
  const headerTranslateY = useRef(new Animated.Value(-30)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(40)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [headerTranslateY, headerOpacity, formTranslateY, formOpacity]);

  // ---------- On mount: check if bill data already exists ----------
  useEffect(() => {
    let isMounted = true;

    const checkBillDataExistence = async () => {
      try {
        const result = await apiClient.get(API_ENDPOINTS.BILL.GET_BILL_DATA);

        if (!isMounted) return;

        const hasBillData = result.success && result.status === 200;

        if (hasBillData) {
          if (navigation?.replace) {
            navigation.replace("DashboardScreen", {
              billData: result.data,
            });
          } else {
            navigation?.navigate?.("DashboardScreen", {
              billData: result.data,
            });
          }
          return;
        }

        // No bill data — reveal the form
        setIsCheckingExistence(false);
      } catch {
        if (!isMounted) return;
        // On any error, default to showing the form so the user can proceed
        setIsCheckingExistence(false);
      }
    };

    checkBillDataExistence();

    return () => {
      isMounted = false;
    };
  }, [navigation]);

  // ---------- Clear helpers ----------
  const clearError = (field) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: "" } : prev));

  const clearBanner = () =>
    setBanner((prev) => (prev.type ? { type: null, message: "" } : prev));

  // ---------- Handlers ----------
  const handleSelectDisco = (disco) => {
    setSelectedDisco(disco);
    clearError("disco");
    clearBanner();
  };

  const handleSelectStatus = (status) => {
    setSelectedStatus(status);
    clearError("status");
    clearBanner();
  };

  const handleSelectPhase = (phase) => {
    setSelectedPhase(phase);
    clearError("phase");
    clearBanner();
  };

  const handlePickImage = (image) => {
    setBillImage(image);
    clearError("image");
    clearBanner();
  };

  const handleRemoveImage = () => {
    setBillImage(null);
  };

  // ---------- Validation ----------
  const validate = () => {
    const next = { disco: "", status: "", phase: "", image: "" };
    if (!selectedDisco) next.disco = "Please select your DISCO";
    if (!selectedStatus) next.status = "Please select your bill status";
    if (!selectedPhase) next.phase = "Please select your meter phase";
    if (!billImage) next.image = "Please upload a bill image to continue";
    return next;
  };

  // ---------- Submit ----------
  const handleContinue = async () => {
    // 1) Required fields
    const nextErrors = validate();
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      setBanner({
        type: "error",
        message: "Please complete all required fields.",
      });
      return;
    }

    // 2) Image format + size check
    const imageCheck = validateBillImage(billImage);
    if (!imageCheck.valid) {
      setErrors((prev) => ({ ...prev, image: imageCheck.message }));
      setBanner({ type: "error", message: imageCheck.message });
      return;
    }

    // 3) Reset + loading
    setErrors({ disco: "", status: "", phase: "", image: "" });
    setIsLoading(true);
    setBanner({ type: null, message: "" });

    try {
      // 4) Build FormData
      const formData = new FormData();
      formData.append("disco", selectedDisco);
      formData.append("status", selectedStatus);
      formData.append("meterPhase", selectedPhase);

      const filePart = await imageToFormPart(billImage);
      formData.append("billImage", filePart);

      // 5) Send request — token auto-attached by apiClient
      const result = await apiClient.postForm(
        API_ENDPOINTS.BILL.BILL_DATA,
        formData,
      );

      setIsLoading(false);

      // 6a) Backend error — show popup
      if (!result.success) {
        let message = result.message;

        if (result.status === 401) {
          message = "Your session has expired. Please sign in again.";
        } else if (result.status === 413) {
          message =
            "Image is too large for the server. Please choose a smaller file.";
        } else if (result.status === 415) {
          message = "Unsupported image format. Please try PNG or JPG.";
        } else if (result.status === 0) {
          message = "Network error. Please check your internet connection.";
        }

        showErrorPopup("Request Failed", message);
        return;
      }

      // 6b) Success → go to Dashboard
      setBanner({
        type: "success",
        message: "Bill data saved successfully.",
      });

      setTimeout(() => {
        if (navigation?.replace) navigation.replace("DashboardScreen");
        else navigation?.navigate?.("DashboardScreen");
      }, 1200);
    } catch (err) {
      setIsLoading(false);
      showErrorPopup(
        "Unexpected Error",
        "Something went wrong. Please try again.",
      );
    }
  };

  // ---------- Render: existence-check loading state ----------
  if (isCheckingExistence) {
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

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScreenBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrap}>
          {/* ---------- Header ---------- */}
          <Animated.View
            style={[
              styles.headerWrap,
              {
                opacity: headerOpacity,
                transform: [{ translateY: headerTranslateY }],
              },
            ]}
          >
            <AuthHeader
              iconName="document-text-outline"
              title="Bill Details"
              subtitle="Tell us about your connection so we can calculate your bill accurately."
            />
          </Animated.View>

          {/* ---------- Form Card ---------- */}
          <Animated.View
            style={[
              styles.formCard,
              {
                opacity: formOpacity,
                transform: [{ translateY: formTranslateY }],
              },
            ]}
          >
            <InfoBanner
              type={banner.type}
              message={banner.message}
              onHide={() => setBanner({ type: null, message: "" })}
            />

            <DiscoSelector
              value={selectedDisco}
              onChange={handleSelectDisco}
              error={errors.disco}
            />

            <StatusSelector
              value={selectedStatus}
              onChange={handleSelectStatus}
              error={errors.status}
            />

            <PhaseSelector
              value={selectedPhase}
              onChange={handleSelectPhase}
              error={errors.phase}
            />

            <BillImagePicker
              image={billImage}
              onChange={handlePickImage}
              onRemove={handleRemoveImage}
              error={errors.image}
            />

            <PrimaryButton
              title="Continue"
              onPress={handleContinue}
              iconName="arrow-forward"
              loading={isLoading}
              style={styles.submitButton}
            />
          </Animated.View>
        </View>
      </ScrollView>

      {/* ---------- Backend error popup ---------- */}
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
  headerWrap: {
    marginBottom: SPACING.lg,
  },
  formCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    ...SHADOWS.medium,
  },
  submitButton: {
    marginTop: SPACING.xs,
  },
});

export default BillDataScreen;
