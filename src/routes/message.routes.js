import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  sendMessage,
  getConversation,
  getConversations
} from "../controllers/message.controller.js";

const router = express.Router();

router.post("/", auth, sendMessage);
router.get("/", auth, getConversations);
router.get("/:userId", auth, getConversation);

export default router;