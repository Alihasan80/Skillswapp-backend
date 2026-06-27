import express from "express";
import auth from "../middleware/auth.middleware.js";
import { matchUsers } from "../controllers/ai.controller.js";

const router = express.Router();

router.post("/match", auth, matchUsers);

export default router;