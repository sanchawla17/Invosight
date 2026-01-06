import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";

const allowedRanges = new Set([7, 30, 90]);
const allowedIntervals = new Set(["day", "week", "month"]);

// Normalize rangeDays to allowed values - expected to be 7, 30, or 90
const normalizeRangeDays = (value) => {
  const parsed = Number.parseInt(value, 10);
  return allowedRanges.has(parsed) ? parsed : 30;
};
// Normalize interval to allowed values - expected to be 'day', 'week', or 'month'
const normalizeInterval = (value) => {
  const normalized =
    typeof value === "string" ? value.toLowerCase() : "day";
  return allowedIntervals.has(normalized) ? normalized : "day";
};
// Helper to get start and end dates based on rangeDays
const getDateRange = (rangeDays) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - rangeDays + 1);
  startDate.setHours(0, 0, 0, 0);
  return { startDate, endDate };
};

// Helper to convert string ID to MongoDB ObjectId
const toObjectId = (id) => new mongoose.Types.ObjectId(id);


// Build statistics for invoices based on user, date range, and interval
export const buildStats = async ({ userId, rangeDays, interval }) => {
  const safeRangeDays = normalizeRangeDays(rangeDays);
  const safeInterval = normalizeInterval(interval);
  const { startDate, endDate } = getDateRange(safeRangeDays);
  const userObjectId = toObjectId(userId);

  const matchStage = {
    user: userObjectId,
    invoiceDate: { $gte: startDate, $lte: endDate },
  };
// Aggregate revenue data grouped by the specified interval
  const revenueSeries = await Invoice.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          $dateTrunc: {
            date: "$invoiceDate",
            unit: safeInterval,
          },
        },
        totalInvoiced: { $sum: { $ifNull: ["$total", 0] } },
        totalPaid: {
          $sum: {
            $cond: [
              { $eq: ["$status", "Paid"] },
              { $ifNull: ["$total", 0] },
              0,
            ],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);
// Format revenue data for output
  const revenueData = revenueSeries.map((item) => ({
    periodStart: new Date(item._id).toISOString(),
    totalInvoiced: Number(item.totalInvoiced || 0),
    totalPaid: Number(item.totalPaid || 0),
  }));

  // Calculate total invoiced and paid amounts
  const totals = revenueData.reduce(
    (acc, item) => ({
      totalInvoiced: acc.totalInvoiced + item.totalInvoiced,
      totalPaid: acc.totalPaid + item.totalPaid,
    }),
    { totalInvoiced: 0, totalPaid: 0 }
  );

  const now = new Date();
  // Aggregate invoice counts by status: Paid, Overdue, Sent
  const statusAgg = await Invoice.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        paid: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, 1, 0] } },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$status", "Paid"] },
                  { $ne: ["$dueDate", null] },
                  { $lt: ["$dueDate", now] },
                ],
              },
              1,
              0,
            ],
          },
        },
        sent: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ["$status", "Paid"] },
                  {
                    $or: [
                      { $eq: ["$dueDate", null] },
                      { $gte: ["$dueDate", now] },
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  const statusCounts = statusAgg[0] || {
    sent: 0,
    paid: 0,
    overdue: 0,
  };
// Format status breakdown for output
  const statusBreakdown = [
    { status: "Sent", count: Number(statusCounts.sent || 0) },
    { status: "Paid", count: Number(statusCounts.paid || 0) },
    { status: "Overdue", count: Number(statusCounts.overdue || 0) },
  ];
// Aggregate top 5 clients by total billed amount
  const topClientsAgg = await Invoice.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $ifNull: ["$billTo.clientName", "Unknown"] },
        totalBilled: { $sum: { $ifNull: ["$total", 0] } },
        totalPaid: {
          $sum: {
            $cond: [
              { $eq: ["$status", "Paid"] },
              { $ifNull: ["$total", 0] },
              0,
            ],
          },
        },
      },
    },
    { $sort: { totalBilled: -1 } },
    { $limit: 5 },
  ]);

  const topClients = topClientsAgg.map((client) => ({
    clientName: client._id && String(client._id).trim() ? client._id : "Unknown",
    totalBilled: Number(client.totalBilled || 0),
    totalPaid: Number(client.totalPaid || 0),
  }));

  return {
    rangeDays: safeRangeDays,
    interval: safeInterval,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    totals: {
      totalInvoiced: totals.totalInvoiced,
      totalPaid: totals.totalPaid,
      totalOutstanding: totals.totalInvoiced - totals.totalPaid,
    },
    revenueSeries: revenueData,
    statusBreakdown,
    topClients,
  };
};
