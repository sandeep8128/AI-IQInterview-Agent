const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../model/user.model");

const isAuth = async (req, res, next) => {
  try {
    const secret = process.env.JWT_SECRET_KEY;

    if (!secret) {
      console.error("JWT_SECRET_KEY is missing");

      return res.status(500).json({
        success: false,
        message: "Internal server configuration error",
      });
    }

    const token = req.cookies?.AuthToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, secret);

    if (
      !decoded ||
      typeof decoded.id !== "string" ||
      !mongoose.Types.ObjectId.isValid(decoded.id)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    req.userId = user._id.toString();

    return next();
  } catch (error) {
    if (
      error.name !== "JsonWebTokenError" &&
      error.name !== "TokenExpiredError" &&
      error.name !== "NotBeforeError"
    ) {
      console.error("Auth Middleware Error:", error);
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = isAuth;
