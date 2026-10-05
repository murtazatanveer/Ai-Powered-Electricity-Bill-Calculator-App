import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../../Theme/colors";

const FormInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  iconName,
  error,
  isPassword = false,
  keyboardType = "default",
  autoCapitalize = "none",
  autoCorrect = false,
  editable = true,
  strength = null, // { level, label, color } or null
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const borderStyle = error
    ? styles.inputWrapperError
    : isFocused
      ? styles.inputWrapperFocused
      : null;

  const iconColor = error
    ? COLORS.error
    : isFocused
      ? COLORS.primary
      : COLORS.textLight;

  return (
    <View style={styles.fieldGroup}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}

      <View style={[styles.inputWrapper, borderStyle]}>
        {iconName ? (
          <Ionicons
            name={iconName}
            size={20}
            color={iconColor}
            style={styles.inputIcon}
          />
        ) : null}

        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          editable={editable}
          secureTextEntry={isPassword && !isVisible}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setIsVisible((v) => !v)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isVisible ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {strength ? (
        <View style={styles.strengthWrap}>
          <View style={styles.strengthBars}>
            {[1, 2, 3, 4].map((i) => (
              <View
                key={i}
                style={[
                  styles.strengthBar,
                  {
                    backgroundColor:
                      i <= strength.level ? strength.color : COLORS.border,
                  },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.strengthLabel, { color: strength.color }]}>
            {strength.label}
          </Text>
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: SPACING.md,
  },
  fieldLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    letterSpacing: 0.3,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: COLORS.borderFocused,
    backgroundColor: COLORS.white,
  },
  inputWrapperError: {
    borderColor: COLORS.borderError,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  eyeButton: {
    padding: SPACING.xxs,
    marginLeft: SPACING.xs,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.error,
    marginTop: SPACING.xxs,
    marginLeft: SPACING.xs,
  },
  strengthWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.xs,
    gap: SPACING.sm,
  },
  strengthBars: {
    flexDirection: "row",
    flex: 1,
    gap: SPACING.xxs,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  strengthLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    minWidth: 48,
    textAlign: "right",
  },
});

export default FormInput;
