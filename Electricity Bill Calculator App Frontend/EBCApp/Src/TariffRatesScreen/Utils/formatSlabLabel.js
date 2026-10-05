/**
 * Turns backend slab type strings into human-readable labels.
 *   "below300"  → "Up to 300 units"
 *   "above700"  → "Above 700 units"
 *   "upto50"    → "Up to 50 units"
 *   "above50"   → "Above 50 units"
 */
export const formatSlabLabel = (slabType) => {
  if (!slabType) return "Slab";

  const belowMatch = slabType.match(/^below(\d+)$/i);
  if (belowMatch) return `Up to ${belowMatch[1]} units`;

  const aboveMatch = slabType.match(/^above(\d+)$/i);
  if (aboveMatch) return `Above ${aboveMatch[1]} units`;

  const uptoMatch = slabType.match(/^upto(\d+)$/i);
  if (uptoMatch) return `Up to ${uptoMatch[1]} units`;

  // Fallback: capitalize first letter
  return slabType.charAt(0).toUpperCase() + slabType.slice(1);
};
