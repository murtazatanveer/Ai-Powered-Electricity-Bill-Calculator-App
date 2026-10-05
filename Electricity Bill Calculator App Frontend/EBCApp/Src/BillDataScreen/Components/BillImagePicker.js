import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";

const BillImagePicker = ({ image, onChange, onRemove, error }) => {
  const handlePick = async () => {
    try {
      // ---------- Web: no permissions API — just open the picker ----------
      // ---------- Native: ask for permission first ----------
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          onChange?.(null);
          // Parent's error handling covers this — user can retry
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.85,
        exif: false,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];

      // Normalized shape so the screen + future upload logic don't care
      // about the platform-specific picker response
      onChange?.({
        uri: asset.uri,
        name: asset.fileName || `bill-${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
        size: asset.fileSize || null,
        width: asset.width || null,
        height: asset.height || null,
      });
    } catch (err) {
      // Silent — parent will show a banner if needed
      console.warn("[BillImagePicker] pick failed:", err?.message);
    }
  };

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>
        Bill Image <Text style={styles.requiredStar}>*</Text>
      </Text>

      {!image ? (
        <TouchableOpacity
          style={[styles.uploadBox, error && styles.uploadBoxError]}
          onPress={handlePick}
          activeOpacity={0.85}
        >
          <View style={styles.uploadIconWrap}>
            <Ionicons
              name="cloud-upload-outline"
              size={28}
              color={error ? COLORS.error : COLORS.primary}
            />
          </View>
          <Text style={[styles.uploadTitle, error && { color: COLORS.error }]}>
            Upload a bill image
          </Text>
          <Text style={styles.uploadSubtitle}>
            Tap to select from{" "}
            {Platform.OS === "web" ? "your files" : "gallery"}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.previewCard}>
          <View style={styles.previewIcon}>
            <Ionicons name="image-outline" size={26} color={COLORS.primary} />
          </View>
          <View style={styles.previewInfo}>
            <Text style={styles.previewName} numberOfLines={1}>
              {image.name}
            </Text>
            <Text style={styles.previewHint}>Ready to upload</Text>
          </View>
          <TouchableOpacity
            onPress={onRemove}
            style={styles.removeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={24} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: SPACING.lg,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    letterSpacing: 0.3,
  },
  requiredStar: {
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  uploadBox: {
    backgroundColor: COLORS.primaryFade,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    alignItems: "center",
    gap: SPACING.xs,
  },
  uploadBoxError: {
    borderColor: COLORS.borderError,
    backgroundColor: COLORS.white,
  },
  uploadIconWrap: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.xs,
    ...SHADOWS.small,
  },
  uploadTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  uploadSubtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  previewIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.primaryFade,
    alignItems: "center",
    justifyContent: "center",
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  previewHint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    padding: SPACING.xxs,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.error,
    marginTop: SPACING.xxs,
    marginLeft: SPACING.xs,
  },
});

export default BillImagePicker;
