import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../../Theme/colors";
import BottomSheetModal from "../../Common/Components/BottomSheetModal";

const DISCOS = [
  "IESCO",
  "LESCO",
  "PESCO",
  "GEPCO",
  "FESCO",
  "MEPCO",
  "HESCO",
  "SEPCO",
  "QESCO",
  "K-Electric",
  "TESCO",
  "HAZECO",
];

const DiscoSelector = ({ value, onChange, error }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (disco) => {
    // Close modal first, then commit selection after animation
    setIsModalOpen(false);
    setTimeout(() => onChange?.(disco), 50);
  };

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>Electricity Provider (DISCO)</Text>

      <TouchableOpacity
        style={[styles.trigger, error && styles.triggerError]}
        onPress={() => setIsModalOpen(true)}
        activeOpacity={0.8}
      >
        <Ionicons
          name="business-outline"
          size={20}
          color={
            error ? COLORS.error : value ? COLORS.primary : COLORS.textLight
          }
          style={styles.triggerIcon}
        />
        <Text style={[styles.triggerText, !value && styles.placeholderText]}>
          {value || "Select your DISCO"}
        </Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.textSecondary} />
      </TouchableOpacity>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <BottomSheetModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Select DISCO"
        subtitle="Choose your electricity distribution company"
      >
        <FlatList
          data={DISCOS}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isSelected = value === item;
            return (
              <TouchableOpacity
                style={[styles.item, isSelected && styles.itemSelected]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.itemText,
                    isSelected && styles.itemTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {isSelected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={COLORS.primary}
                  />
                ) : null}
              </TouchableOpacity>
            );
          }}
        />
      </BottomSheetModal>
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
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  triggerError: {
    borderColor: COLORS.borderError,
    backgroundColor: COLORS.white,
  },
  triggerIcon: {
    marginRight: SPACING.sm,
  },
  triggerText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textPrimary,
  },
  placeholderText: {
    color: COLORS.textLight,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.error,
    marginTop: SPACING.xxs,
    marginLeft: SPACING.xs,
  },
  list: {
    paddingBottom: SPACING.md,
    gap: SPACING.xs,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundLight,
  },
  itemSelected: {
    backgroundColor: COLORS.primaryFade,
  },
  itemText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  itemTextSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

export default DiscoSelector;
