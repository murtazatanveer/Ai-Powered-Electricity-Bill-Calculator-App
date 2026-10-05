/**
 * The backend sends `statusUpdated` as a boolean indicating whether the
 * status of the connection was auto-updated by the tariff engine during
 * this reading.
 *
 * This helper turns that boolean into a human-readable phrase.
 */
export const getStatusUpdatedLabel = (statusUpdated) => {
  if (statusUpdated === true) return "Auto-updated";
  if (statusUpdated === false) return "Not auto-updated";
  return "—";
};

/**
 * Returns an icon name + color for the statusUpdated flag.
 * Blue/green for auto-updated, gray for not.
 */
export const getStatusUpdatedMeta = (statusUpdated, COLORS) => {
  if (statusUpdated === true) {
    return {
      icon: "sync-outline",
      color: COLORS.info,
      label: "Auto-updated",
    };
  }
  return {
    icon: "remove-outline",
    color: COLORS.textLight,
    label: "Not auto-updated",
  };
};
