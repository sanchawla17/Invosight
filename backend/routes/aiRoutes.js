import express from "express";
import {
  parseInvoiceFromText,
  parseInvoiceFromImage,
  generateReminderEmail,
  getDashboardSummary,
  getStatsInsights,
} from "../controllers/aiController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { aiRateLimit } from "../middlewares/rateLimit.js";

const router = express.Router();

router.post("/parse-text", protect, aiRateLimit, parseInvoiceFromText);
router.post("/parse-image", protect, aiRateLimit, parseInvoiceFromImage);
router.post("/generate-reminder", protect, aiRateLimit, generateReminderEmail);
router.get("/dashboard-summary", protect, aiRateLimit, getDashboardSummary);
router.get("/stats-insights", protect, aiRateLimit, getStatsInsights);

export default router;
