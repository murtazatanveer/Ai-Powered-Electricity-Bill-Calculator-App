import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";

const FilterButton = ({ onPress, activeCount = 0 }) => {
  const isActive = activeCount > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.button, isActive && styles.buttonActive]}
    >
      <Ionicons
        name="options-outline"
        size={18}
        color={isActive ? COLORS.white : COLORS.primary}
      />
      <Text style={[styles.label, isActive && styles.labelActive]}>
        Filters
      </Text>
      {isActive ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{activeCount}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.circle,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  buttonActive: {
    backgroundColor: COLORS.primary,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  labelActive: {
    color: COLORS.white,
  },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SPACING.xxs,
  },
  badgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
});

export default FilterButton;
