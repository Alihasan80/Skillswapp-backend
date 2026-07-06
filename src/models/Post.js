import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    author:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:       { type: String, required: true },
    description: { type: String, default: "" },
    likes:       [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        user:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text:      { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    saved: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Post", postSchema);