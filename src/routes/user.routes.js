import express from "express";
import auth from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.js";
import {
  getAllUsers,
  getMyProfile,
  updateProfile,
  getUserById,
  changePassword, 
  deleteUser,
  uploadAvatar 
} from "../controllers/user.controller.js";

const router = express.Router();

// GET /api/users         -all users (protected)
// GET /api/users/me      - my profile (protected)
// PUT /api/users/me      - update my profile (protected)
// GET /api/users/:id     - any user by id (protected)

router.get("/", auth, getAllUsers);
router.get("/me", auth, getMyProfile);
router.put("/me", auth, updateProfile);
router.get("/:id", auth, getUserById);
router.put("/me",              auth, updateProfile);      // Settings save
router.put("/change-password", auth, changePassword); 
router.delete("/:id", auth, deleteUser);   

router.put(
  "/avatar",
  auth,
  upload.single("avatar"),
  uploadAvatar
);  

export default router;