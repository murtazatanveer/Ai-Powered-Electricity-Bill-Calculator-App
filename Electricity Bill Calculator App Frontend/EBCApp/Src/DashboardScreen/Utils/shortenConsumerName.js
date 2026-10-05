/**
 * Consumer names from the backend often contain a full address separated by
 * newlines (e.g. "TANVEER AHMAD\nFATEH ALI\nKOT PEHPRA\nP.D.KHAN").
 * This helper extracts just the first line, which is the actual name.
 */
export const getConsumerDisplayName = (rawName) => {
  if (!rawName || typeof rawName !== "string") return "Consumer";
  const firstLine = rawName.split("\n")[0].trim();
  return firstLine || "Consumer";
};
