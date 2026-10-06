/**
 * Describes a status change in human-friendly terms.
 * Handles the case where previousStatus might be missing.
 *
 * Returns { changed: boolean, title: string, message: string, isDowngrade: boolean }
 */
export const describeStatusChange = (
  statusUpdated,
  previousStatus,
  newStatus,
) => {
  if (!statusUpdated || !newStatus) {
    return { changed: false, title: "", message: "", isDowngrade: false };
  }

  if (!previousStatus || previousStatus === newStatus) {
    return {
      changed: false,
      title: "",
      message: "",
      isDowngrade: false,
    };
  }

  // Determine if the change is a downgrade (bad news) or an upgrade (good news)
  const rank = { Lifeline: 1, Protected: 2, "Not Protected": 3 };
  const isDowngrade = (rank[newStatus] ?? 0) > (rank[previousStatus] ?? 0);

  const title = isDowngrade ? "Status Downgraded" : "Status Upgraded";

  const message = isDowngrade
    ? `Your electricity status has changed from ${previousStatus} to ${newStatus}. This may affect your tariff rates on future bills.`
    : `Great news — your electricity status has been upgraded from ${previousStatus} to ${newStatus}. You may benefit from lower tariff rates.`;

  return { changed: true, title, message, isDowngrade };
};
