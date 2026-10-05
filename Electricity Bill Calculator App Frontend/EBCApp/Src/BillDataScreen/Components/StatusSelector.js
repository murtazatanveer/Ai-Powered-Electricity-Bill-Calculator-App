import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../../Theme/colors";

const STATUSES = ["Protected", "Not Protected", "Lifeline"];

const getStatusMeta = (status) => {
  if (status === "Protected")
    return { icon: "shield-checkmark-outline", color: COLORS.success };
  if (status === "Lifeline")
    return { icon: "flash-outline", color: COLORS.info };
  return { icon: "alert-circle-outline", color: COLORS.warning };
};

const StatusSelector = ({ value, onChange, error }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>Current Status</Text>

    <View style={styles.row}>
      {STATUSES.map((status) => {
        const meta = getStatusMeta(status);
        const isSelected = value === status;
        return (
          <TouchableOpacity
            key={status}
            onPress={() => onChange?.(status)}
            activeOpacity={0.85}
            style={[
              styles.card,
              isSelected && styles.cardSelected,
              isSelected && { borderColor: meta.color },
            ]}
          >
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: isSelected
                    ? meta.color
                    : COLORS.backgroundGray,
                },
              ]}
            >
              <Ionicons
                name={meta.icon}
                size={18}
                color={isSelected ? COLORS.white : meta.color}
              />
            </View>
            <Text
              style={[
                styles.label,
                isSelected && {
                  color: COLORS.primary,
                  fontWeight: TYPOGRAPHY.weights.semibold,
                },
              ]}
              numberOfLines={2}
            >
              {status}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>

    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

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
  row: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  card: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 2,
    paddingHorizontal: SPACING.xs,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
  },
  cardSelected: {
    backgroundColor: COLORS.primaryFade,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.circle,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textSecondary,
    textAlign: "center",
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.error,
    marginTop: SPACING.xxs,
    marginLeft: SPACING.xs,
  },
});

export default StatusSelector;
