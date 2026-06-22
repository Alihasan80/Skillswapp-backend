import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import { successResponse, errorResponse } from "../utils/response.js";

// GET ALL USERS
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
       _id: { $ne: req.user.id },
         phoneVerified: true,
           isAdmin: { $ne: true }


     })
      .select("-password")
      .sort({ createdAt: -1 });

    return successResponse(res, "Users fetched", users);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server error");
  }
};

// GET MY PROFILE
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    return successResponse(res, "Profile fetched", user);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server error");
  }
};

// UPDATE PROFILE (FIXED)
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      role,
      location,
      about,
      offers,
      needs,
      avatar,
      email,
      availability,   
      notifyEmail,
      notifyMessages,
      notifyReminders,
    } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        role,
        location,
        about,
        offers,
        needs,
        avatar,
        email,
        availability,   // ✅ SAVE IT HERE
        notifyEmail,
        notifyMessages,
        notifyReminders,
      },
      { new: true }
    ).select("-password");

    return successResponse(res, "Profile updated", updated);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server error");
  }
};

export const updateMe = updateProfile;

// GET USER BY ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return errorResponse(res, "User not found", 404);

    return successResponse(res, "User fetched", user);
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server error");
  }
};

export const getMe = getMyProfile;

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, "Both passwords required", 400);
    }

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return errorResponse(res, "Current password incorrect", 400);
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(req.user.id, {
      password: hashed,
    });

    return successResponse(res, "Password updated");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Server error");
  }
};
// avatar added
export const uploadAvatar = async (req, res) => {
  try {
    const avatar = `/uploads/${req.file.filename}`;

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true }
    );

    res.json({
      success: true,
      avatar: updated.avatar,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

