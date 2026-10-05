import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  BORDER_RADIUS,
  SHADOWS,
} from "../../Theme/colors";

const AuthHeader = ({ iconName, title, subtitle }) => (
  <View style={styles.header}>
    <View style={styles.badge}>
      <Ionicons name={iconName} size={24} color={COLORS.white} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: SPACING.lg },
  badge: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.xxs,
    textAlign: "center",
  },
});

export default AuthHeader;
