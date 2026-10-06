import { COLORS } from "../../Theme/colors";

/**
 * Picks an icon + color for a suggestion string based on keywords.
 * Safe fallback if nothing matches.
 */
export const getRecommendationIcon = (text = "") => {
  const lower = text.toLowerCase();

  // Pace / speed
  if (
    lower.includes("pace") ||
    lower.includes("faster") ||
    lower.includes("slower") ||
    lower.includes("daily") ||
    lower.includes("per day")
  ) {
    return { icon: "speedometer-outline", color: COLORS.info };
  }

  // Status change risk
  if (
    lower.includes("status") ||
    lower.includes("protected") ||
    lower.includes("lifeline") ||
    lower.includes("tier") ||
    lower.includes("threshold")
  ) {
    return { icon: "shield-outline", color: COLORS.warning };
  }

  // Money / bill impact
  if (
    lower.includes("bill") ||
    lower.includes("rs") ||
    lower.includes("cost") ||
    lower.includes("rupee") ||
    lower.includes("pay")
  ) {
    return { icon: "cash-outline", color: COLORS.error };
  }

  // Consumption
  if (
    lower.includes("consume") ||
    lower.includes("usage") ||
    lower.includes("units")
  ) {
    return { icon: "flash-outline", color: COLORS.primary };
  }

  return { icon: "bulb-outline", color: COLORS.primary };
};
