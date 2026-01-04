const formatNumber = (value) =>
  Number.isFinite(value) ? value.toFixed(2) : "0.00";

const parseAmount = (value) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export { formatNumber, parseAmount };
