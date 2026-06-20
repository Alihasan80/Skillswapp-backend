import mongoose from "mongoose";

const availabilitySlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    required: true,
  },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: { type: String, default: "Mentor" },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    avatar: { type: String, default: "" },
    location: { type: String, default: "Pakistan" },
    about: { type: String, default: "" },
    offers: { type: [String], default: [] },
    needs: { type: [String], default: [] },

    availability: {
      type: [availabilitySlotSchema],
      default: [],
    },

    rating: { type: Number, default: 0 },
    views: { type: Number, default: 0 },

    //OTP
    phone: {
      type: String,
      default: "",
    },

    phoneVerified: {
      type: Boolean,
      default: false,
    },

    otpCode: {
      type: String,
      default: "",
    },

    otpExpires: {
      type: Date,
      default: null,
    },
  },
  
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
