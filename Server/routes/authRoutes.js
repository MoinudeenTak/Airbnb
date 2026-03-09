import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  refreshToken
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";
import { validateRegister, validateLogin } from "../middleware/validators.js";

const router = express.Router();

// Register a new user with validation
router.post("/register", validateRegister, registerUser);


// Login with validation
router.post("/login", validateLogin, loginUser);

// Get current logged-in user
router.get("/me", protect, getMe);

// Refresh access token
router.post("/refresh", refreshToken);

// Logout user
router.post("/logout", logoutUser); // no protect middleware

export default router;