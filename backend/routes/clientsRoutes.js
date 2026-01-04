import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getClients,
  getClientDetail,
} from "../controllers/clientsController.js";

const router = express.Router();

router.get("/", protect, getClients);
router.get("/:clientKey", protect, getClientDetail);

export default router;
