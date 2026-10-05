import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../../Theme/colors";

const METER_PHASES = ["Single Phase", "Three Phase"];

const getPhaseMeta = (phase) => {
  if (phase === "Single Phase") return { icon: "flash-outline" };
  return { icon: "flash" };
};

const PhaseSelector = ({ value, onChange, error }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>Meter Phase</Text>

    <View style={styles.row}>
      {METER_PHASES.map((phase) => {
        const meta = getPhaseMeta(phase);
        const isSelected = value === phase;
        return (
          <TouchableOpacity
            key={phase}
            onPress={() => onChange?.(phase)}
            activeOpacity={0.85}
            style={[styles.card, isSelected && styles.cardSelected]}
          >
            <Ionicons
              name={meta.icon}
              size={22}
              color={isSelected ? COLORS.white : COLORS.primary}
            />
            <Text style={[styles.label, isSelected && { color: COLORS.white }]}>
              {phase}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    height: 56,
  },
  cardSelected: {
    backgroundColor: COLORS.primary,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.error,
    marginTop: SPACING.xxs,
    marginLeft: SPACING.xs,
  },
});

export default PhaseSelector;
