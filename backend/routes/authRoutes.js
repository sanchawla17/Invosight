import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  updateUserProfile,
  logoutUser,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authRateLimit } from "../middlewares/rateLimit.js";

const router = express.Router();

router.use(authRateLimit);

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/logout", logoutUser);
router.route('/me').get(protect, getMe).put(protect, updateUserProfile);

export default router;
