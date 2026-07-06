import express from "express";
import { getActivities } from "../controllers/activity.controller.js";
import auth from "../middleware/auth.middleware.js";

const router = express.Router();

//get all activities for the authenticated user
router.get("/", auth, getActivities);

export default router;