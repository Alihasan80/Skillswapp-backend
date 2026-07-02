import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  addReview,
  getUserReviews,
  getMyReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

// POST  /api/reviews           → add review
// GET   /api/reviews/my        → get my reviews
// GET   /api/reviews/:userId   → get reviews for any user

router.post("/", auth, addReview);
router.get("/my", auth, getMyReviews);
router.get("/:userId", auth, getUserReviews);

export default router;