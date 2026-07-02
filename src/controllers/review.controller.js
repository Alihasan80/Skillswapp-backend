import Review from "../models/Review.js";
import User from "../models/User.model.js";

// POST /api/reviews — add review
export const addReview = async (req, res) => {
  try {
    const { reviewee, rating, comment, skill } = req.body;

    if (!reviewee || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Reviewee, rating and comment are required"
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5"
      });
    }

    // prevent reviewing yourself
    if (String(reviewee) === String(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot review yourself"
      });
    }

    //  prevent duplicate review
    const existing = await Review.findOne({
      reviewer: req.user.id,
      reviewee,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this user"
      });
    }

    const review = await Review.create({
      reviewer: req.user.id,
      reviewee,
      rating,
      comment,
      skill: skill || "",
    });

    await review.populate("reviewer", "name avatar role");

    // update user average rating
    const allReviews = await Review.find({ reviewee });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await User.findByIdAndUpdate(reviewee, {
      rating: Math.round(avgRating * 10) / 10
    });

    res.status(201).json({ success: true, message: "Review added!", data: review });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reviews/:userId — get reviews for a user
export const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "name avatar role")
      .sort({ createdAt: -1 });

    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      data: reviews,
      avgRating: Math.round(avgRating * 10) / 10,
      total: reviews.length,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/reviews/my — get reviews I received
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.user.id })
      .populate("reviewer", "name avatar role")
      .sort({ createdAt: -1 });

    const avgRating = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      data: reviews,
      avgRating: Math.round(avgRating * 10) / 10,
      total: reviews.length,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};