// Format monetary values to two decimal places with a dollar sign

export const formatMoney = (value) =>
  `$${Number(value || 0).toFixed(2)}`;
