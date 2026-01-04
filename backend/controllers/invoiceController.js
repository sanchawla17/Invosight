import jwt from "jsonwebtoken";
import Invoice from "../models/Invoice.js";
import {
  calculateDueDate,
  calculateTotals,
  createShareToken,
  shareTokenSecret,
} from "../utils/invoiceUtils.js";

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Private
export const createInvoice = async (req, res) => {
  try {
    const user = req.user;
    let {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
    } = req.body;

    if (!dueDate) {
      const computedDueDate = calculateDueDate(invoiceDate, paymentTerms);
      if (computedDueDate) {
        dueDate = computedDueDate;
      }
    }

    const { subtotal, taxTotal, total } = calculateTotals(items);

    const invoice = new Invoice({
      user,
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
      subtotal,
      taxTotal,
      total,
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating invoice", error: error.message });
  }
};

// @desc    Get all invoices of logged-in user
// @route   GET /api/invoices
// @access  Private
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id }).populate(
      "user",
      "name email"
    );
    res.json(invoices);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching invoice", error: error.message });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    // Check if the invoice belongs to the user
    if (invoice.user._id.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    res.json(invoice);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching invoice", error: error.message });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
export const updateInvoice = async (req, res) => {
  try {
    let {
      invoiceNumber,
      invoiceDate,
      dueDate,
      billFrom,
      billTo,
      items,
      notes,
      paymentTerms,
      status,
    } = req.body;

    if (!dueDate) {
      const computedDueDate = calculateDueDate(invoiceDate, paymentTerms);
      if (computedDueDate) {
        dueDate = computedDueDate;
      }
    }

    const { subtotal, taxTotal, total } = calculateTotals(items);

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        invoiceNumber,
        invoiceDate,
        dueDate,
        billFrom,
        billTo,
        items,
        notes,
        paymentTerms,
        status,
        subtotal,
        taxTotal,
        total,
      },
      { new: true }
    );

    if (!updatedInvoice)
      return res.status(404).json({ message: "Invoice not found" });

    res.json(updatedInvoice);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating invoice", error: error.message });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });
    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting invoice", error: error.message });
  }
};

// @desc    Create share link for invoice
// @route   POST /api/invoices/:id/share
// @access  Private
export const createShareLink = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (invoice.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    invoice.shareEnabled = true;
    await invoice.save();

    const shareToken = createShareToken(invoice._id.toString());
    res.json({ shareToken });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating share link", error: error.message });
  }
};

// @desc    Disable share link for invoice
// @route   POST /api/invoices/:id/share/disable
// @access  Private
export const disableShareLink = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (invoice.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    invoice.shareEnabled = false;
    await invoice.save();

    res.json({ message: "Share link disabled" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error disabling share link", error: error.message });
  }
};

// @desc    Get shared invoice by token
// @route   GET /api/invoices/share/:token
// @access  Public
export const getSharedInvoice = async (req, res) => {
  try {
    if (!shareTokenSecret) {
      return res.status(500).json({ message: "Share tokens not configured" });
    }

    const decoded = jwt.verify(req.params.token, shareTokenSecret);
    if (decoded?.type !== "invoice_share") {
      return res.status(401).json({ message: "Invalid share token" });
    }

    const invoice = await Invoice.findById(decoded.invoiceId).lean();
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (!invoice.shareEnabled) {
      return res.status(403).json({ message: "Share link disabled" });
    }

    delete invoice.user;
    delete invoice.__v;

    res.json(invoice);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Share link expired" });
    }
    res
      .status(500)
      .json({ message: "Error fetching shared invoice", error: error.message });
  }
};

