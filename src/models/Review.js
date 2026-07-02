import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating:   { type: Number, min: 1, max: 5, required: true },
    comment:  { type: String, required: true },
    skill:    { type: String, default: "" }, // ✅ what skill was swapped
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
