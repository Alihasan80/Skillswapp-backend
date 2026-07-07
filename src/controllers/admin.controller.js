import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import Skill from "../models/Skill.model.js";
import Review from "../models/Review.js";
import SwapRequest from "../models/SwapRequest.model.js";

//create admin 
export const createAdmin = async (req, res) => {
  try {
    const adminExists = await User.findOne({
      isAdmin: true,
    });

    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: "Admin already exists",
      });
    }

    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "Admin",
      isAdmin: true,
      phoneVerified: true,
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      adminId: admin._id,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//get allusers
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
  isAdmin: { $ne: true }
})
      .select("-password -otpCode");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// get dashboardstats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const verifiedUsers =
      await User.countDocuments({
        phoneVerified: true,
      });

    const totalSkills =
      await Skill.countDocuments();

    const totalSkillRequests =
      await SwapRequest.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        totalSkills,
        totalSkillRequests,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//get only unverified person
export const getUnverifiedUsers = async (req, res) => {
  try {
    const users = await User.find({
      phoneVerified: false,
    }).select("-password -otpCode");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//get getUserSkills
export const getUserSkills = async (req, res) => {
  try {
    const { userId } = req.params;

    const skills = await Skill.find({
      user: userId,
    }).select(
      "title category level status createdAt"
    );

    res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//delete btn
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Safety: don't allow deleting admin
    if (user.isAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin account cannot be deleted",
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//getall review
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
     .populate("reviewer", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//deletereview by id
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};