import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  refreshToken,
  logoutUser,
  becomeHost,
  forgotPassword,
  resetPassword,
  googleLogin,
  facebookLogin,
} from "./authController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/google", googleLogin);
router.post("/facebook", facebookLogin);
router.post("/logout", logoutUser);
router.patch("/become-host", protect, becomeHost);

export default router;