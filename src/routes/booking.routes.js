import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  createBooking,
  getBookings,
  updateBooking,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/", auth, createBooking);
router.get("/", auth, getBookings);
router.patch("/:id", auth, updateBooking);

export default router;