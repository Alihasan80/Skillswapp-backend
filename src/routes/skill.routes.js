import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
  getSkills,
  addSkill,
  updateSkill,
  deleteSkill, // add this
} from "../controllers/skill.controller.js";

const router = express.Router();

router.get("/",     auth, getSkills);
router.post("/",    auth, addSkill);
router.patch("/:id", auth, updateSkill);
router.delete("/:id", auth, deleteSkill); //  add this

export default router;