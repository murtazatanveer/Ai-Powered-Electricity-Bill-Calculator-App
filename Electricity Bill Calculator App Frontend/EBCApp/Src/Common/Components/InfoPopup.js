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

const InfoPopup = ({
  visible,
  icon = "information-circle",
  iconColor = COLORS.info,
  title = "Heads up",
  message = "",
  buttonTitle = "Got it",
  onClose,
  children,
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
          <View style={[styles.iconBadge, { backgroundColor: iconColor }]}>
            <Ionicons name={icon} size={36} color={COLORS.white} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {/* Optional children (e.g., a details panel) */}
          {children ? (
            <View style={styles.childrenWrap}>{children}</View>
          ) : null}

          {/* Single button */}
          <TouchableOpacity
            onPress={handleClose}
            activeOpacity={0.85}
            style={[styles.button, { backgroundColor: iconColor }]}
          >
            <Text style={styles.buttonText}>{buttonTitle}</Text>
          </TouchableOpacity>
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
    width: 68,
    height: 68,
    borderRadius: BORDER_RADIUS.circle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    marginTop: -SPACING.xxxl - 2,
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
  },
  childrenWrap: {
    width: "100%",
    marginTop: SPACING.md,
  },
  button: {
    width: "100%",
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: SPACING.lg,
    ...SHADOWS.medium,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
    letterSpacing: 0.3,
  },
});

export default InfoPopup;
