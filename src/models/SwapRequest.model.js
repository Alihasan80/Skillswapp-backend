import mongoose from "mongoose";

const swapRequestSchema = new mongoose.Schema(
  {
    fromUser:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUser:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    offerSkill:   { type: String, required: true },
    wantSkill:    { type: String, required: true },
    message:      { type: String, required: true },
    availability: { type: String, required: true },
    status:       { type: String, enum: ["Pending", "Accepted", "Rejected"], default: "Pending" },
  },
  { timestamps: true }
);

export default mongoose.model("SwapRequest", swapRequestSchema);