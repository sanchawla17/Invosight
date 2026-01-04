import moment from "moment";

const PAYMENT_TERM_DAYS = {
  "Net 15": 15,
  "Net 30": 30,
  "Net 60": 60,
  "Due on receipt": 0,
};

const PAYMENT_TERMS_OPTIONS = Object.keys(PAYMENT_TERM_DAYS);

const calculateDueDate = (invoiceDate, paymentTerms) => {
  if (!invoiceDate) {
    return "";
  }
  const days = PAYMENT_TERM_DAYS[paymentTerms];
  if (days === undefined) {
    return "";
  }
  const date = moment(invoiceDate);
  if (!date.isValid()) {
    return "";
  }
  return date.add(days, "days").format("YYYY-MM-DD");
};

const calculateTotals = (items = []) => {
  let subtotal = 0;
  let taxTotal = 0;
  items.forEach((item) => {
    const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
    subtotal += itemTotal;
    taxTotal += itemTotal * ((item.taxPercent || 0) / 100);
  });
  return { subtotal, taxTotal, total: subtotal + taxTotal };
};

const attachItemTotals = (items = []) =>
  items.map((item) => ({
    ...item,
    total:
      (item.quantity || 0) *
      (item.unitPrice || 0) *
      (1 + (item.taxPercent || 0) / 100),
  }));

export {
  PAYMENT_TERM_DAYS,
  PAYMENT_TERMS_OPTIONS,
  calculateDueDate,
  calculateTotals,
  attachItemTotals,
};
