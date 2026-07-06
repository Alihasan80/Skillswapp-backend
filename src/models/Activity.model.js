import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,    
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    partner: {
      type: String,
    },
    icon: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    date: {
      type: String,
      default: "Today",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);