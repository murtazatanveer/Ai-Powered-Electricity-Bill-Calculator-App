export const COLORS = {
  // Primary Brand Colors
  primary: "#0B6E4F", // Main green color
  primaryDark: "#064E37", // Darker green for pressed states
  primaryLight: "#1B8A63", // Lighter green for hover/active states
  primaryFade: "#E6F4EE", // Very light green tint for backgrounds

  // Secondary Colors
  secondary: "#2E8B57", // Sea green for secondary elements
  secondaryLight: "#A8D5BA", // Light sea green

  // Neutral Colors
  white: "#FFFFFF",
  black: "#000000",

  // Background Colors
  background: "#FFFFFF", // Main background
  backgroundLight: "#FAFAFA", // Light background for cards
  backgroundGray: "#F5F5F5", // Gray background for sections

  // Text Colors
  textPrimary: "#1A1A1A", // Primary text color
  textSecondary: "#666666", // Secondary text
  textLight: "#999999", // Light text for placeholders
  textWhite: "#FFFFFF", // White text on dark backgrounds

  // Border Colors
  border: "#E8E8E8", // Default border
  borderFocused: "#0B6E4F", // Border when focused
  borderError: "#FF3B30", // Error border

  // Status Colors
  success: "#34C759", // Success green
  error: "#FF3B30", // Error red
  warning: "#FF9500", // Warning orange
  info: "#007AFF", // Info blue

  // Shadow Colors
  shadow: "#0B6E4F", // Shadow color matching brand
  shadowLight: "rgba(0,0,0,0.08)",
  shadowMedium: "rgba(11,110,79,0.15)",
  shadowHeavy: "rgba(11,110,79,0.25)",

  // Specific UI Colors
  cardBackground: "#FFFFFF",
  inputBackground: "#FAFAFA",
  disabledBackground: "#CCCCCC",
  disabledText: "#999999",

  // Skeleton / loading placeholders
  skeleton: "#DCE4DF", // muted green-gray — visible on cream bg
  skeletonHighlight: "#C8D4CE", // slightly darker for pulse peak

  // Transparent Colors
  transparent: "transparent",
  overlay: "rgba(0,0,0,0.4)",
  overlayLight: "rgba(11,110,79,0.05)",
};

// Gradient configurations
export const GRADIENTS = {
  primary: {
    colors: ["#0B6E4F", "#064E37"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  card: {
    colors: ["#FFFFFF", "#FAFAFA"],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
};

// Typography
export const TYPOGRAPHY = {
  // Font Sizes
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 34,
  },

  // Font Weights
  weights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },

  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

// Spacing
export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

// Border Radius
export const BORDER_RADIUS = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  circle: 999,
};

// Shadow
export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
};

// Export all as default
export default {
  COLORS,
  GRADIENTS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
};
