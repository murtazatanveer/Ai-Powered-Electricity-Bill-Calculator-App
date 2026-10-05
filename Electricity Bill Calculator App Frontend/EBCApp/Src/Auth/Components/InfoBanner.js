import { useEffect, useRef } from "react";
import { Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../../Theme/colors";

const InfoBanner = ({ type, message, onHide, autoDismissMs = 3000 }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (!type) return;

    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    if (autoDismissMs > 0) {
      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onHide?.());
      }, autoDismissMs);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [type, message, autoDismissMs, opacity, onHide]);

  if (!type) return null;

  const isError = type === "error";
  const accentColor = isError ? COLORS.error : COLORS.success;

  // Defensive: banner only renders strings. If a caller ever passes an
  // object/array, fall back to a generic message instead of crashing.
  const safeMessage =
    typeof message === "string" && message.trim()
      ? message
      : "Something went wrong.";

  return (
    <Animated.View
      style={[
        styles.banner,
        isError ? styles.bannerError : styles.bannerSuccess,
        { opacity },
      ]}
    >
      <Ionicons
        name={isError ? "alert-circle" : "checkmark-circle"}
        size={18}
        color={accentColor}
      />
      <Text style={[styles.bannerText, { color: accentColor }]}>
        {safeMessage}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  bannerError: {
    backgroundColor: "#FDECEA",
    borderColor: "#F5C6C2",
  },
  bannerSuccess: {
    backgroundColor: "#E8F8EE",
    borderColor: "#C3E9D0",
  },
  bannerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default InfoBanner;
