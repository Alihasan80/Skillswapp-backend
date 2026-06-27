import express from "express";
import { matchUsers } from "../controllers/match.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/match
router.get("/", auth, matchUsers);

export default router;