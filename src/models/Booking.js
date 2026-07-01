import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    learner: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    teacher: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    skill: { 
      type: String, 
      required: true 
    },
    date: { 
      type: String, 
      required: true 
    },
    time: { 
      type: String, 
      default: "" 
    },
    notes: { 
      type: String, 
      default: "" 
    },

    // ✅ NEW FIELD
    meetLink: { 
      type: String, 
      default: "" 
    },

    status: { 
      type: String, 
      enum: ["pending", "confirmed", "completed", "cancelled"], 
      default: "pending" 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);