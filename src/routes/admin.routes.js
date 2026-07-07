import express from "express";
import {
  createAdmin,
  getAllUsers,
  getDashboardStats,
  getUnverifiedUsers,
  getUserSkills,
  getAllReviews,
  deleteReview,
  deleteUser,
} from "../controllers/admin.controller.js";
import auth from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";
const router = express.Router();

// router.post("/create-admin", createAdmin);
router.get("/users", auth, adminMiddleware, getAllUsers);
router.get("/dashboard", auth, adminMiddleware, getDashboardStats);
router.get("/unverified-users", auth, adminMiddleware, getUnverifiedUsers);

router.get("/user-skills/:userId", auth, adminMiddleware, getUserSkills);
router.get("/reviews", auth, adminMiddleware, getAllReviews);
router.delete("/reviews/:reviewId", auth, adminMiddleware, deleteReview);
router.delete("/users/:userId", auth, adminMiddleware, deleteUser);

export default router;
