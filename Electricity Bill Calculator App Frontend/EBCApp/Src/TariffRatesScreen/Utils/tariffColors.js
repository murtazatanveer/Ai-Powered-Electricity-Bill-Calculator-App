import { COLORS } from "../../Theme/colors";

/**
 * Returns the accent + tint colors used for a given tariff category.
 */
export const getCategoryColors = (categoryKey) => {
  switch (categoryKey) {
    case "lifeline":
      return {
        accent: COLORS.info,
        tint: "#E6F0FF",
        border: "#A8C6F5",
        label: "Lifeline",
        icon: "flash-outline",
      };
    case "protected":
      return {
        accent: COLORS.success,
        tint: "#E8F8EE",
        border: "#A8DCBB",
        label: "Protected",
        icon: "shield-checkmark-outline",
      };
    case "unprotected":
      return {
        accent: COLORS.warning,
        tint: "#FFF4E6",
        border: "#F5C99B",
        label: "Unprotected",
        icon: "alert-circle-outline",
      };
    default:
      return {
        accent: COLORS.primary,
        tint: COLORS.primaryFade,
        border: COLORS.primaryLight,
        label: categoryKey,
        icon: "pricetag-outline",
      };
  }
};
