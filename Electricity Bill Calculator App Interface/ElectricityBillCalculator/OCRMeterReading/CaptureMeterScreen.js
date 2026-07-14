// src/screens/CaptureMeterScreen.js
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  SafeAreaView,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../Components/Colors";

// 🔑 PASTE YOUR GOOGLE VISION API KEY HERE
const GOOGLE_VISION_API_KEY = "AIzaSyAIG4f1o3J0786xOKZU6ytOzsocbCsXb-g";

// 🎯 Mock Bill Data Generator (Used for the pop-up)
const generateMockBill = (units) => {
  const baseRate = 12.5; // PKR per unit
  const energyCharges = units * baseRate;
  const fixedCharges = 150;
  const taxes = energyCharges * 0.17; // 17% GST
  const total = energyCharges + fixedCharges + taxes;
  return {
    units,
    energyCharges: energyCharges.toFixed(2),
    fixedCharges: fixedCharges.toFixed(2),
    taxes: taxes.toFixed(2),
    total: total.toFixed(2),
  };
};

export default function CaptureMeterScreen({ navigation }) {
  // --- ALL EXISTING LOGIC REMAINS COMPLETELY UNCHANGED ---
  const [imageUri, setImageUri] = useState(null);
  const [extractedReading, setExtractedReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualReading, setManualReading] = useState("");
  const [step, setStep] = useState("capture"); // "capture", "review", "saved"

  // 🆕 NEW STATE: For the Mock Bill Modal
  const [billModalVisible, setBillModalVisible] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need camera access to take a photo of your meter.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets) {
      setImageUri(result.assets[0].uri);
      setStep("review");
      setExtractedReading(null);
      setManualReading("");
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need gallery access to upload a photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets) {
      setImageUri(result.assets[0].uri);
      setStep("review");
      setExtractedReading(null);
      setManualReading("");
    }
  };

  const processImageWithOCR = async () => {
    if (!imageUri) return;

    setLoading(true);
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const reader = new FileReader();

      const base64Image = await new Promise((resolve, reject) => {
        reader.onload = () => {
          const base64String = reader.result.split(",")[1];
          resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const body = JSON.stringify({
        requests: [
          {
            image: {
              content: base64Image,
            },
            features: [
              {
                type: "TEXT_DETECTION",
                maxResults: 1,
              },
            ],
          },
        ],
      });

      const apiResponse = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        },
      );

      const result = await apiResponse.json();

      if (result.responses && result.responses[0].fullTextAnnotation) {
        const rawText = result.responses[0].fullTextAnnotation.text;
        const numbers = rawText.match(/\d+/g);
        if (numbers) {
          const probableReading = numbers.reduce((a, b) =>
            a.length >= b.length ? a : b,
          );
          setExtractedReading(probableReading);
          setManualReading(probableReading);
        } else {
          Alert.alert(
            "No Numbers Found",
            "We couldn't detect any numbers. Please try a clearer photo or enter manually.",
          );
          setExtractedReading(null);
        }
      } else {
        Alert.alert(
          "OCR Failed",
          "Could not read the image. Please try again.",
        );
      }
    } catch (error) {
      console.error("OCR Error:", error);
      Alert.alert(
        "Error",
        "Something went wrong. Please check your internet connection.",
      );
    } finally {
      setLoading(false);
    }
  };

  // 🆕 UPDATED: Save the reading and trigger the Bill Modal
  const handleConfirm = () => {
    if (!manualReading || manualReading.length < 4) {
      Alert.alert(
        "Invalid Reading",
        "Please enter a valid meter reading (at least 4 digits).",
      );
      return;
    }

    // Generate Mock Bill Data
    const readingValue = parseInt(manualReading);
    const bill = generateMockBill(readingValue);
    setCurrentBill(bill);

    // Transition to the Saved state and open the modal
    setStep("saved");
    setBillModalVisible(true);
  };

  const handleRetake = () => {
    setImageUri(null);
    setExtractedReading(null);
    setManualReading("");
    setStep("capture");
  };

  // =====================================================================
  // ✅ UI REDESIGN BEGINS HERE (Logic preserved above)
  // =====================================================================

  // --- UI: STEP 1 - CAPTURE ---
  if (step === "capture") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Capture Reading</Text>
          <Text style={styles.headerSubtitle}>
            Take a photo of your electricity meter to get started
          </Text>
        </View>

        <View style={styles.captureButtonsContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="camera"
                size={32}
                color={COLORS.background}
              />
            </View>
            <Text style={styles.captureButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={pickImage}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons
                name="image-multiple"
                size={32}
                color={COLORS.background}
              />
            </View>
            <Text style={styles.captureButtonText}>Upload from Gallery</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <MaterialCommunityIcons
            name="lightbulb-on-outline"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.infoText}>
            Make sure the meter display is clear and well-lit.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // --- UI: STEP 2 - REVIEW & CONFIRM ---
  if (step === "review") {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.headerTitle}>Review Reading</Text>

          {imageUri && (
            <View style={styles.imageCard}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            </View>
          )}

          <View style={styles.ocrSection}>
            <Text style={styles.sectionLabel}>Extracted Reading</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primarySupport} />
                <Text style={styles.loadingText}>Analyzing image...</Text>
              </View>
            ) : extractedReading ? (
              <View style={styles.extractedBox}>
                <Text style={styles.extractedNumber}>{extractedReading}</Text>
                <Text style={styles.extractedLabel}>
                  Click "Confirm" below if this is correct.
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.processButton}
                onPress={processImageWithOCR}
              >
                <MaterialCommunityIcons
                  name="text-recognition"
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.processButtonText}>Extract Numbers</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.manualSection}>
            <Text style={styles.sectionLabel}>Or Enter Manually</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.manualInput}
                placeholder="12345678"
                placeholderTextColor={COLORS.primary + "60"}
                keyboardType="numeric"
                value={manualReading}
                onChangeText={setManualReading}
              />
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleRetake}
            >
              <Text style={styles.retakeButtonText}>Retake Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>Confirm Reading</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- UI: STEP 3 - SAVED (Success + Beautiful Mock Bill Modal) ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.successContainer}>
        <View style={styles.successIconCircle}>
          <MaterialCommunityIcons
            name="check-circle"
            size={64}
            color={COLORS.success}
          />
        </View>
        <Text style={styles.successTitle}>Reading Saved!</Text>
        <Text style={styles.successSubtitle}>
          Meter Reading:{" "}
          <Text style={{ fontWeight: "700" }}>{manualReading}</Text>
        </Text>

        {/* 🆕 Button to view the mock bill */}
        <TouchableOpacity
          style={styles.viewBillButton}
          onPress={() => setBillModalVisible(true)}
        >
          <Text style={styles.viewBillButtonText}>📄 View Estimated Bill</Text>
        </TouchableOpacity>

        {/* ✅ FIXED: Go Back Button now calls handleRetake to reset to Capture screen */}
        <TouchableOpacity style={styles.goBackButton} onPress={handleRetake}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>

      {/* 🆕 BILL MODAL POP-UP */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={billModalVisible}
        onRequestClose={() => setBillModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Estimated Bill Summary</Text>
              <TouchableOpacity onPress={() => setBillModalVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.billCard}>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Units Consumed</Text>
                <Text style={styles.billValue}>{currentBill?.units} kWh</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Energy Charges</Text>
                <Text style={styles.billValue}>
                  PKR {currentBill?.energyCharges}
                </Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Fixed Charges</Text>
                <Text style={styles.billValue}>
                  PKR {currentBill?.fixedCharges}
                </Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Taxes (GST 17%)</Text>
                <Text style={styles.billValue}>PKR {currentBill?.taxes}</Text>
              </View>
              <View style={[styles.billRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Estimated Bill</Text>
                <Text style={styles.totalValue}>PKR {currentBill?.total}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalDoneButton}
              onPress={() => setBillModalVisible(false)}
            >
              <Text style={styles.modalDoneButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Global Container
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: "center",
    paddingTop: 10,
  },

  // Header
  headerContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.primary,
    opacity: 0.6,
    textAlign: "center",
  },

  // Capture Buttons
  captureButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 30,
    width: "100%",
  },
  captureButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(29, 46, 27, 0.08)",
    maxWidth: 160,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  captureButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    textAlign: "center",
  },

  // Info Card
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(29, 46, 27, 0.1)",
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.8,
    marginLeft: 8,
    flex: 1,
  },

  // Image Preview
  imageCard: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 20,
    padding: 8,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: 16,
    resizeMode: "cover",
  },

  // OCR Section
  ocrSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.6,
    marginTop: 8,
  },
  extractedBox: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(29, 46, 27, 0.1)",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  extractedNumber: {
    fontSize: 42,
    fontWeight: "bold",
    color: COLORS.primarySupport,
    letterSpacing: 2,
  },
  extractedLabel: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.6,
    marginTop: 8,
  },
  processButton: {
    flexDirection: "row",
    backgroundColor: COLORS.primarySupport,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: COLORS.primarySupport,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  processButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Manual Section
  manualSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  inputWrapper: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(29, 46, 27, 0.15)",
  },
  manualInput: {
    width: "100%",
    paddingVertical: 12,
    fontSize: 18,
    color: COLORS.primary,
    textAlign: "center",
    fontWeight: "500",
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    width: "100%",
    marginTop: 8,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    alignItems: "center",
  },
  retakeButtonText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1.5,
    backgroundColor: COLORS.primarySupport,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: COLORS.primarySupport,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  // Success Screen (Redesigned Button)
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 222, 66, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 18,
    color: COLORS.primary,
    opacity: 0.7,
    marginBottom: 20,
    textAlign: "center",
  },
  viewBillButton: {
    backgroundColor: "rgba(29, 46, 27, 0.08)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  viewBillButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // 🎯 NEW PROFESSIONAL "GO BACK" BUTTON
  goBackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 50, // Elegant pill shape
    borderWidth: 1,
    borderColor: "rgba(29, 46, 27, 0.1)",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    gap: 8,
    marginTop: 20, // Added margin to separate from the Bill button
  },
  goBackButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },

  // 🆕 BILL MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },
  billCard: {
    backgroundColor: "rgba(200, 210, 166, 0.3)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(29, 46, 27, 0.05)",
  },
  billLabel: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.7,
  },
  billValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: COLORS.primary,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primarySupport,
  },
  modalDoneButton: {
    backgroundColor: COLORS.primarySupport,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalDoneButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
