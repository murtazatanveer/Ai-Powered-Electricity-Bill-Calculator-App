// src/screens/CaptureMeterScreen.js
import React, { useState } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import COLORS from "../Components/Colors";

// 🔑 PASTE YOUR GOOGLE VISION API KEY HERE
const GOOGLE_VISION_API_KEY = "AIzaSyAIG4f1o3J0786xOKZU6ytOzsocbCsXb-g";

export default function CaptureMeterScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null);
  const [extractedReading, setExtractedReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualReading, setManualReading] = useState("");
  const [step, setStep] = useState("capture"); // "capture", "review", "saved"

  // --- Open Camera ---
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
      allowsEditing: false, // <-- Fixed: No more stuck crop screen
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

  // --- Open Gallery ---
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
      allowsEditing: false, // <-- Fixed: No more stuck crop screen
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

  // --- Send Image to Google Vision API (Fixed Android base64 error) ---
  const processImageWithOCR = async () => {
    if (!imageUri) return;

    setLoading(true);
    try {
      // ✅ FIX: Fetch the image as a blob, then convert to base64 manually
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const reader = new FileReader();

      const base64Image = await new Promise((resolve, reject) => {
        reader.onload = () => {
          // Remove the data:image/jpeg;base64, prefix
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

        // 🧠 Extract only numbers from the text
        const numbers = rawText.match(/\d+/g);
        if (numbers) {
          // Join all numbers and take the longest contiguous string (usually the meter reading)
          const fullNumber = numbers.join("");
          // Meter readings are usually 5-8 digits. Take the longest match.
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
  // --- Save the Reading ---
  const handleConfirm = () => {
    if (!manualReading || manualReading.length < 4) {
      Alert.alert(
        "Invalid Reading",
        "Please enter a valid meter reading (at least 4 digits).",
      );
      return;
    }
    setStep("saved");
    // 🚀 Here you will later save to Firestore and call the Billing Engine
    Alert.alert(
      "Success",
      `Meter Reading ${manualReading} saved successfully!`,
    );
  };

  const handleRetake = () => {
    setImageUri(null);
    setExtractedReading(null);
    setManualReading("");
    setStep("capture");
  };

  // --- UI: STEP 1 - CAPTURE ---
  if (step === "capture") {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Meter Reading</Text>
          <Text style={styles.headerSubtitle}>
            Take a photo of your electricity meter to get started
          </Text>
        </View>

        <View style={styles.captureButtonsContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
            <MaterialCommunityIcons
              name="camera"
              size={48}
              color={COLORS.primary}
            />
            <Text style={styles.captureButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={pickImage}>
            <MaterialCommunityIcons
              name="image-multiple"
              size={48}
              color={COLORS.primary}
            />
            <Text style={styles.captureButtonText}>Upload from Gallery</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.helperText}>
          Make sure the meter display is clear and well-lit.
        </Text>
      </View>
    );
  }

  // --- UI: STEP 2 - REVIEW & CONFIRM (Fixed ScrollView Layout) ---
  if (step === "review") {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent} // <-- Fixed layout error
      >
        <Text style={styles.headerTitle}>Review Reading</Text>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
        )}

        <View style={styles.ocrSection}>
          <Text style={styles.sectionLabel}>Extracted Reading</Text>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primarySupport} />
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
              <Text style={styles.processButtonText}>🔍 Extract Numbers</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.manualSection}>
          <Text style={styles.sectionLabel}>Or Enter Manually</Text>
          <TextInput
            style={styles.manualInput}
            placeholder="e.g. 12345678"
            keyboardType="numeric"
            value={manualReading}
            onChangeText={setManualReading}
          />
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
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
    );
  }

  // --- UI: STEP 3 - SAVED (Success) ---
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="check-circle"
        size={80}
        color={COLORS.success}
      />
      <Text style={styles.successTitle}>Reading Saved!</Text>
      <Text style={styles.successSubtitle}>Meter Reading: {manualReading}</Text>
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
    // ❌ alignItems and justifyContent REMOVED from here
  },
  scrollContent: {
    paddingBottom: 40,
    alignItems: "center", // ✅ Moved here
    justifyContent: "center", // ✅ Moved here
    flexGrow: 1,
  },
  headerContainer: {
    alignItems: "center",
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
    opacity: 0.7,
    textAlign: "center",
  },
  captureButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 30,
  },
  captureButton: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    width: 150,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  captureButtonText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
  },
  helperText: {
    fontSize: 14,
    color: COLORS.primary,
    opacity: 0.6,
    textAlign: "center",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    resizeMode: "contain",
    marginBottom: 20,
    backgroundColor: "#00000010",
  },
  ocrSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 10,
  },
  extractedBox: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  extractedNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: COLORS.primarySupport,
  },
  extractedLabel: {
    fontSize: 12,
    color: COLORS.primary,
    opacity: 0.6,
    marginTop: 4,
  },
  processButton: {
    backgroundColor: COLORS.primarySupport,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  processButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  manualSection: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  manualInput: {
    width: "80%",
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    color: COLORS.primary,
    textAlign: "center",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 10,
  },
  retakeButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  retakeButtonText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    backgroundColor: COLORS.primarySupport,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginTop: 16,
  },
  successSubtitle: {
    fontSize: 18,
    color: COLORS.primary,
    marginTop: 4,
    marginBottom: 30,
  },
  doneButton: {
    backgroundColor: COLORS.primarySupport,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});
