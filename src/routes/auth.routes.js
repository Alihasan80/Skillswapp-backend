import express from "express";
import { register, login, resetPassword, sendOtp, verifyOtp,  forgotPassword } from "../controllers/auth.controller.js";
import validateRequest from "../middleware/validateRequest.js";
import {
  registerValidator,
} from "../validators/auth.Validator.js";

const router = express.Router();

// Register
router.post(
  "/register",
  registerValidator,
  validateRequest,
  register
);
// Login
router.post(
  "/login",
  validateRequest,
  login
);
// Reset Password
router.post("/reset-password", resetPassword);
router.post("/forgot-password", forgotPassword);
//otp 
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);


export default router;