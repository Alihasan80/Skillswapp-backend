import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import axios from "axios";  

// register
export const register = async (req, res) => {
  try {
    const { name, email, password, role, location, about, offers, needs, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
 const user= await User.create({
  name,
  email,
  password:  hashedPassword,
  role:      role     || "Skill Swapper",
  location:  location || "Pakistan",
  about:     about    || "",
  offers:    offers   || [],
  needs:     needs    || [],
  avatar:    avatar   || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`
});

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId:user._id,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ------------------
//OTP controller
export const sendOtp = async (req, res) => {
  try {
    const { userId, phone } = req.body;

    const user = await User.findById(userId);
//   //  already existed number only show when user enter verifiedPhone=true
//   //bcz sometimes usernot verify it and left there after sometime the again add
//   //using unverified number
//     const existingPhoneUser = await User.findOne({
//   phone,
//   _id: { $ne: userId },
//   phoneVerified: true,
// });

// if (existingPhoneUser) {
//   return res.status(400).json({
//     success: false,
//     message:
//       "This phone number is already linked to another account.",
//   });
// }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Cost protection
    if (
      user.otpCode &&
      user.otpExpires &&
      user.otpExpires > new Date()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP already sent. Please wait before requesting again.",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpires = new Date(
      Date.now() + 5 * 60 * 1000
    );

    user.phone = phone;
    user.otpCode = otp;
    user.otpExpires = otpExpires;

    await user.save();

    const smsMessage = `SkillSwap Verification

Your OTP is: ${otp}

Valid for 5 minutes.`;

    try {
      const response = await axios.post(
        "https://api.veevotech.com/v3/sendsms",
        {
          hash: process.env.VEEVO_HASH_KEY,
          receivernum: phone,
          textmessage: smsMessage,
        }
      );

      const data = response.data;

      if (data.STATUS !== "SUCCESSFUL") {
        user.otpCode = "";
        user.otpExpires = null;

        await user.save();

        return res.status(500).json({
          success: false,
          message:
            "Failed to send OTP. Please try again.",
        });
      }

      return res.json({
        success: true,
        message: "OTP sent successfully",
      });

    } catch (smsError) {
      user.otpCode = "";
      user.otpExpires = null;

      await user.save();

      return res.status(500).json({
        success: false,
        message:
          "Failed to send OTP. Please try again.",
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// -----------------
// verifyOtp
export const verifyOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otpCode) {
      return res.status(400).json({
        success: false,
        message: "OTP not generated",
      });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      }); 
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.phoneVerified = true;
    user.otpCode = "";
    user.otpExpires = null;

    await user.save();

    res.json({
      success: true,
      message: "Phone verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

if (!user.phoneVerified) {
  return res.status(403).json({
    success: false,
    message: "Please verify your phone number first",
    requiresPhoneVerification: true,
    userId: user._id,
    phone: user.phone,
  });
}
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        _id:    user._id,
        name:   user.name,
        email:  user.email,
        role:   user.role,
        isAdmin: user.isAdmin,


        avatar: user.avatar,
        offers: user.offers,
        needs:  user.needs,
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
//rest password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });
    res.json({ success: true, message: "Password reset!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
//forget-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const generatedPassword =
      "SS" + Math.random().toString(36).slice(-8);

    const hashedPassword = await bcrypt.hash(
      generatedPassword,
      10
    );

    user.password = hashedPassword;

    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "SkillSwap Password Reset",
      html: `
        <h2>SkillSwap Password Reset</h2>

        <p>Hello ${user.name},</p>

        <p>Your new temporary password is:</p>

        <h3>${generatedPassword}</h3>

        <p>Please login using this password and change it from your profile settings.</p>

        <p>Thank you,<br/>SkillSwap Team</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "A new password has been sent to your email.",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};