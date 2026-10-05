// Placeholder bill calculator — mirrors the backend's output shape.
// Replace with real API call later; the screen won't need to change.

const MOCK_SLABS = [
  { slabType: "below100", units: 100, ratePerUnit: 22.44 },
  { slabType: "below200", units: 100, ratePerUnit: 28.91 },
  { slabType: "below300", units: 100, ratePerUnit: 33.1 },
  { slabType: "below400", units: 100, ratePerUnit: 36.46 },
  { slabType: "below500", units: 50, ratePerUnit: 38.95 },
];

const computeSlabs = (units) => {
  let remaining = units;
  const slabs = [];
  for (const s of MOCK_SLABS) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, s.units);
    slabs.push({
      slabType: s.slabType,
      units: take,
      ratePerUnit: s.ratePerUnit,
      cost: +(take * s.ratePerUnit).toFixed(2),
    });
    remaining -= take;
  }
  return slabs;
};

export const calculatePlaceholderBill = ({ units, FPA = 0, QTA = 0 }) => {
  const slabWiseEnergyCost = computeSlabs(units);
  const costOfElectricity = slabWiseEnergyCost.reduce(
    (sum, s) => sum + s.cost,
    0,
  );

  const fixedCharges = 500.0;
  const electricityDuty = +(costOfElectricity * 0.015).toFixed(2);
  const fcSurcharge = +(units * 0.43).toFixed(2);
  const tvFee = 35.0;
  const fpaCost = +(units * (FPA || 0)).toFixed(2);
  const qtaCost = +(units * (QTA || 0)).toFixed(2);

  const subtotal =
    costOfElectricity +
    fixedCharges +
    electricityDuty +
    fcSurcharge +
    tvFee +
    fpaCost +
    qtaCost;

  const GST = +(subtotal * 0.18).toFixed(2);
  const totalBill = +(subtotal + GST).toFixed(2);

  const status =
    units <= 100 ? "Lifeline" : units <= 300 ? "Protected" : "Not Protected";

  return {
    uid: `mock-${Date.now()}`,
    createdAt: new Date().toISOString(),
    consumedUnits: units,
    status,
    statusUpdated: true,
    totalBill,
    slabWiseEnergyCost,
    billBreakDown: {
      costOfElectricity: +costOfElectricity.toFixed(2),
      fixedCharges,
      electricityDuty,
      fcSurcharge,
      QTA: qtaCost,
      FPA: fpaCost,
      tvFee,
      GST,
    },
  };
};
