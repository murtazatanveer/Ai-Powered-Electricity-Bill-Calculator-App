import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";

const HeaderWithBack = ({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRightPress,
}) => (
  <View style={styles.row}>
    <TouchableOpacity
      onPress={onBack}
      activeOpacity={0.75}
      style={styles.backButton}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
    </TouchableOpacity>

    <View style={styles.textWrap}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      ) : null}
    </View>

    {rightIcon ? (
      <TouchableOpacity
        onPress={onRightPress}
        activeOpacity={0.75}
        style={styles.rightButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name={rightIcon} size={22} color={COLORS.textPrimary} />
      </TouchableOpacity>
    ) : (
      <View style={styles.rightPlaceholder} />
    )}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  rightButton: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  rightPlaceholder: {
    width: 40,
    height: 40,
  },
});

export default HeaderWithBack;
