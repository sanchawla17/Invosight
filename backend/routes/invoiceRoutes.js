import express from "express";
import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  createShareLink,
  disableShareLink,
  getSharedInvoice,
} from "../controllers/invoiceController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/share/:token", getSharedInvoice);

router.route("/").post(protect, createInvoice).get(protect, getInvoices);
router.post("/:id/share", protect, createShareLink);
router.post("/:id/share/disable", protect, disableShareLink);

router
  .route("/:id")
  .get(protect, getInvoiceById)
  .put(protect, updateInvoice)
  .delete(protect, deleteInvoice)

export default router;
