import { View, Text, Image, StyleSheet } from "react-native";
import { COLORS, SPACING, TYPOGRAPHY } from "../../Theme/colors";

const BrandHeader = ({ logoSize = 140, showSubtitle = true, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../../assets/splash-icon.png")}
          style={[styles.logoImage, { width: logoSize, height: logoSize }]}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.appName}>Electricity Bill</Text>

      {showSubtitle ? (
        <Text style={styles.subtitle}>C A L C U L A T O R</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  logoImage: {
    // width/height set dynamically via prop
  },
  appName: {
    fontSize: TYPOGRAPHY.sizes.display,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    letterSpacing: -1,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    letterSpacing: 6,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: "center",
  },
});

export default BrandHeader;
