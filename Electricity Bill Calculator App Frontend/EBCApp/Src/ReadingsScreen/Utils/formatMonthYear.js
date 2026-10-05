const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getMonthYearLabel = (dateInput) => {
  const date = new Date(dateInput);
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

export const getMonthKey = (dateInput) => {
  const date = new Date(dateInput);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

export const getMonthLabel = (monthNumber) => MONTHS[monthNumber - 1];

// Groups readings by month+year, preserving "newest first" order.
export const groupReadingsByMonth = (readings) => {
  const sorted = [...readings].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  const groups = new Map();
  for (const reading of sorted) {
    const key = getMonthKey(reading.createdAt);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: getMonthYearLabel(reading.createdAt),
        data: [],
      });
    }
    groups.get(key).data.push(reading);
  }
  return Array.from(groups.values());
};

export const formatReadingDate = (dateInput) => {
  const date = new Date(dateInput);
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTHS[date.getMonth()].slice(0, 3);
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatCurrency = (amount) => {
  if (amount == null) return "—";
  return `Rs ${Number(amount).toLocaleString("en-PK", {
    maximumFractionDigits: 0,
  })}`;
};

export const MONTH_OPTIONS = MONTHS.map((name, idx) => ({
  label: name,
  value: idx + 1,
}));

export const YEARS = [2024, 2025, 2026];

export const STATUS_OPTIONS = ["Protected", "Not Protected", "Lifeline"];

export const formatRate = (value) =>
  value == null ? "—" : Number(value).toFixed(2);

export const slabLabel = (slabType) => {
  if (!slabType) return "Slab";
  const match = slabType.match(/below(\d+)/i);
  if (match) return `Up to ${match[1]} units`;
  return slabType;
};
