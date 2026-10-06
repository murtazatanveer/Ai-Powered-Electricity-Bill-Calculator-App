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

// value → exact string sent to the backend
// label → what the user sees in the dropdown
const DISCOS = [
  { value: "IESCO", label: "IESCO (Islamabad)" },
  { value: "LESCO", label: "LESCO (Lahore)" },
  { value: "PESCO", label: "PESCO (Peshawar)" },
  { value: "GEPCO", label: "GEPCO (Gujranwala)" },
  { value: "FESCO", label: "FESCO (Faisalabad)" },
  { value: "MEPCO", label: "MEPCO (Multan)" },
  { value: "HESCO", label: "HESCO (Hyderabad)" },
  { value: "SEPCO", label: "SEPCO (Sukkur)" },
  { value: "QESCO", label: "QESCO (Quetta)" },
  { value: "K-Electric", label: "K-Electric (Karachi)" },
  { value: "TESCO", label: "TESCO (Tribal Areas)" },
  { value: "HAZECO", label: "HAZECO (Hazara)" },
];

const DiscoSelector = ({ value, onChange, error }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (discoValue) => {
    setIsModalOpen(false);
    setTimeout(() => onChange?.(discoValue), 50);
  };

  // Find the label to display for the currently-selected value
  const selectedItem = DISCOS.find((d) => d.value === value);
  const displayLabel = selectedItem ? selectedItem.label : null;

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
          {displayLabel || "Select your DISCO"}
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
          keyExtractor={(item) => item.value}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const isSelected = value === item.value;
            return (
              <TouchableOpacity
                style={[styles.item, isSelected && styles.itemSelected]}
                onPress={() => handleSelect(item.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.itemText,
                    isSelected && styles.itemTextSelected,
                  ]}
                >
                  {item.label}
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
