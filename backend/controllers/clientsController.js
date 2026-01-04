import Invoice from "../models/Invoice.js";
import mongoose from "mongoose";

const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const buildClientMatch = (userId, clientKey) => {
  const decodedKey = decodeURIComponent(clientKey || "");
  if (decodedKey.startsWith("email:")) {
    const email = decodedKey.slice("email:".length);
    if (!email) {
      return null;
    }
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return {
      user: toObjectId(userId),
      "billTo.email": { $regex: `^${escaped}$`, $options: "i" },
    };
  }
  if (decodedKey.startsWith("name:")) {
    const name = decodedKey.slice("name:".length);
    if (!name) {
      return null;
    }
    return {
      user: toObjectId(userId),
      "billTo.clientName": name,
    };
  }
  return null;
};

// @desc    Get aggregated clients list
// @route   GET /api/clients
// @access  Private
export const getClients = async (req, res) => {
  try {
    const now = new Date();
    const clients = await Invoice.aggregate([
      { $match: { user: toObjectId(req.user.id) } },
      {
        $addFields: {
          clientNameSafe: { $ifNull: ["$billTo.clientName", "Unknown"] },
          clientEmailLower: { $toLower: { $ifNull: ["$billTo.email", ""] } },
        },
      },
      {
        $addFields: {
          clientKey: {
            $cond: [
              { $gt: [{ $strLenCP: "$clientEmailLower" }, 0] },
              { $concat: ["email:", "$clientEmailLower"] },
              { $concat: ["name:", "$clientNameSafe"] },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$clientKey",
          clientName: { $first: "$clientNameSafe" },
          clientEmail: { $first: "$billTo.email" },
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
          overdueCount: {
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
          invoiceCount: { $sum: 1 },
          lastInvoiceDate: { $max: "$invoiceDate" },
        },
      },
      {
        $addFields: {
          totalOutstanding: { $subtract: ["$totalBilled", "$totalPaid"] },
        },
      },
      { $sort: { totalBilled: -1 } },
    ]);

    res.json(
      clients.map((client) => ({
        clientKey: client._id,
        clientName: client.clientName,
        clientEmail: client.clientEmail || "",
        totalBilled: Number(client.totalBilled || 0),
        totalPaid: Number(client.totalPaid || 0),
        totalOutstanding: Number(client.totalOutstanding || 0),
        overdueCount: Number(client.overdueCount || 0),
        invoiceCount: Number(client.invoiceCount || 0),
        lastInvoiceDate: client.lastInvoiceDate,
      }))
    );
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching clients", error: error.message });
  }
};

// @desc    Get client detail and invoices
// @route   GET /api/clients/:clientKey
// @access  Private
export const getClientDetail = async (req, res) => {
  try {
    const match = buildClientMatch(req.user.id, req.params.clientKey);
    if (!match) {
      return res.status(400).json({ message: "Invalid client key" });
    }

    const invoices = await Invoice.find(match)
      .sort({ invoiceDate: -1 })
      .lean();

    if (!invoices.length) {
      return res.status(404).json({ message: "Client not found" });
    }

    const now = new Date();
    let totalBilled = 0;
    let totalPaid = 0;
    let overdueCount = 0;

    invoices.forEach((invoice) => {
      const amount = Number(invoice.total || 0);
      totalBilled += amount;
      if (invoice.status === "Paid") {
        totalPaid += amount;
      } else if (invoice.dueDate) {
        const dueDate = new Date(invoice.dueDate);
        if (!Number.isNaN(dueDate.getTime())) {
          const dueEnd = new Date(dueDate);
          dueEnd.setHours(23, 59, 59, 999);
          if (dueEnd < now) {
            overdueCount += 1;
          }
        }
      }
    });

    const totalOutstanding = totalBilled - totalPaid;
    const averageInvoiceValue =
      invoices.length > 0 ? totalBilled / invoices.length : 0;

    const clientInfo = {
      name: invoices[0].billTo?.clientName || "Unknown",
      email: invoices[0].billTo?.email || "",
    };

    res.json({
      client: clientInfo,
      summary: {
        totalBilled,
        totalPaid,
        totalOutstanding,
        averageInvoiceValue,
        overdueCount,
        invoiceCount: invoices.length,
        lastInvoiceDate: invoices[0].invoiceDate,
      },
      invoices: invoices.map((invoice) => ({
        _id: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        total: invoice.total,
        status: invoice.status,
        billTo: invoice.billTo,
      })),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching client", error: error.message });
  }
};
