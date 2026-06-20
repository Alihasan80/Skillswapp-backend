import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default auth;