import jwt from "jsonwebtoken";

const shareTokenSecret = process.env.SHARE_TOKEN_SECRET || process.env.JWT_SECRET;
const shareTokenTtl = process.env.SHARE_TOKEN_TTL || "7d";

const createShareToken = (invoiceId) => {
  if (!shareTokenSecret) {
    throw new Error("Missing SHARE_TOKEN_SECRET/JWT_SECRET for share tokens.");
  }
  return jwt.sign({ invoiceId, type: "invoice_share" }, shareTokenSecret, {
    expiresIn: shareTokenTtl,
  });
};

const paymentTermDays = {
  "Net 15": 15,
  "Net 30": 30,
  "Net 60": 60,
  "Due on receipt": 0,
};

const calculateDueDate = (invoiceDate, paymentTerms) => {
  if (!invoiceDate) {
    return null;
  }
  const days = paymentTermDays[paymentTerms];
  if (days === undefined) {
    return null;
  }
  const baseDate = new Date(invoiceDate);
  if (Number.isNaN(baseDate.getTime())) {
    return null;
  }
  baseDate.setDate(baseDate.getDate() + days);
  return baseDate;
};

const calculateTotals = (items = []) => {
  let subtotal = 0;
  let taxTotal = 0;
  items.forEach((item) => {
    const quantity = Number(item.quantity || 0);
    const unitPrice = Number(item.unitPrice || 0);
    const taxPercent = Number(item.taxPercent || 0);
    subtotal += unitPrice * quantity;
    taxTotal += (unitPrice * quantity * taxPercent) / 100;
  });

  const total = subtotal + taxTotal;
  return { subtotal, taxTotal, total };
};

export { shareTokenSecret, createShareToken, calculateDueDate, calculateTotals };
