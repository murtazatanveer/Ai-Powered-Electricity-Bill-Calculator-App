import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";

const PrimaryButton = ({
  title,
  onPress,
  iconName,
  iconSize = 20,
  loading = false,
  disabled = false,
  variant = "solid", // "solid" | "outline"
  style,
}) => {
  const isDisabled = disabled || loading;
  const isOutline = variant === "outline";

  const contentColor = isOutline ? COLORS.primary : COLORS.white;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isOutline ? styles.outline : styles.solid,
        isDisabled &&
          (isOutline ? styles.outlineDisabled : styles.solidDisabled),
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={contentColor} />
      ) : (
        <View style={styles.contentRow}>
          {iconName ? (
            <Ionicons
              name={iconName}
              size={iconSize}
              color={contentColor}
              style={styles.icon}
            />
          ) : null}
          <Text
            style={[
              styles.text,
              isOutline ? styles.outlineText : styles.solidText,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.medium,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: SPACING.xs,
  },
  solid: {
    backgroundColor: COLORS.primary,
  },
  solidDisabled: {
    backgroundColor: COLORS.primaryDark,
    opacity: 0.8,
  },
  solidText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.3,
  },
  outline: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  outlineDisabled: {
    borderColor: COLORS.border,
    opacity: 0.6,
  },
  outlineText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

export default PrimaryButton;
