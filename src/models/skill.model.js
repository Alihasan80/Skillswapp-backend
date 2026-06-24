import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title:    { type: String, required: true },
    category: { type: String, default: "code" },
    level:    { type: String, default: "Beginner" },
    status:   { type: String, default: "Active" },
  },
  { timestamps: true }
);
// console.log("Existing models:", Object.keys(mongoose.models));
export default mongoose.models.Skill ||
  mongoose.model("Skill", skillSchema);