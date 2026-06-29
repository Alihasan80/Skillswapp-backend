import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  sendSwapRequest,
  getMySwapRequests,
  updateSwapRequest,
} from "../controllers/swaprequest.controller.js";

const router = express.Router();

// POST   /api/swaprequests       - send request
// GET    /api/swaprequests       - get my requests
// PATCH  /api/swaprequests/:id   - accept or reject

router.post("/", auth, sendSwapRequest);
router.get("/", auth, getMySwapRequests);
router.patch("/:id", auth, updateSwapRequest);

export default router;