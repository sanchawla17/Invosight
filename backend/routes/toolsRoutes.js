import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { convertCurrency } from "../controllers/toolsController.js";

const router = express.Router();

router.get("/convert", protect, convertCurrency);

export default router;
