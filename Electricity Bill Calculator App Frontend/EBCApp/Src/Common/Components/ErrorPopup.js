import { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";
import PrimaryButton from "./PrimaryButton";

const ErrorPopup = ({
  visible,
  title = "Something went wrong",
  message = "",
  onClose,
  buttonTitle = "Got it",
}) => {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      backdropOpacity.setValue(0);
      scaleValue.setValue(0.85);
      cardOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          useNativeDriver: true,
          damping: 14,
          stiffness: 180,
          mass: 0.8,
        }),
      ]).start();
    }
  }, [visible, backdropOpacity, scaleValue, cardOpacity]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => onClose?.());
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        {/* Tapping the backdrop also dismisses */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />

        <Animated.View
          style={[
            styles.card,
            {
              opacity: cardOpacity,
              transform: [{ scale: scaleValue }],
            },
          ]}
        >
          {/* Icon badge */}
          <View style={styles.iconBadge}>
            <Ionicons name="alert-circle" size={40} color={COLORS.white} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Button */}
          <PrimaryButton
            title={buttonTitle}
            onPress={handleClose}
            iconName="checkmark-circle-outline"
            style={styles.button}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xxl,
    paddingTop: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    alignItems: "center",
    ...SHADOWS.large,
  },
  iconBadge: {
    width: 76,
    height: 76,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    marginTop: -SPACING.xxxl - 6,
    borderWidth: 4,
    borderColor: COLORS.white,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: SPACING.xs,
  },
  message: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  button: {
    width: "100%",
  },
});

export default ErrorPopup;
