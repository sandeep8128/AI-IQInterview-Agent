const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../model/user.model");
const { generateToken } = require("../config/JwtToken");
const { sendPasswordResetEmail } = require("../services/email.service");

const COOKIE_NAME = "AuthToken";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const RESET_TOKEN_EXPIRY = 15 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};

const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: COOKIE_MAX_AGE,
  });
};

const sanitizeUser = (user) => {
  const safeUser = user.toObject ? user.toObject() : { ...user };

  delete safeUser.passwordHash;
  delete safeUser.passwordResetTokenHash;
  delete safeUser.passwordResetExpires;
  delete safeUser.__v;

  return safeUser;
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must contain 2 to 100 characters",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (cleanEmail.length > 254 || !emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password must contain 8 to 128 characters",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      isEmailVerified: false,
    });

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    console.error("Registration Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail,
    }).select("+passwordHash");

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (!process.env.CLIENT_URL) {
      console.error("CLIENT_URL is missing in backend .env");

      return res.status(500).json({
        success: false,
        message: "Password reset is temporarily unavailable",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });

    // Same response for existing and non-existing accounts.
    const genericMessage =
      "If an account exists with this email, a password reset link will be sent.";

    if (!user || !user.passwordHash) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY);

    await user.save();

    const frontendUrl = process.env.CLIENT_URL.replace(/\/+$/, "");
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
      });
    } catch (emailError) {
      // Invalidate the token if the email could not be sent.
      user.passwordResetTokenHash = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      console.error("Password reset email error:", emailError.message);

      return res.status(500).json({
        success: false,
        message:
          "Unable to send the reset email. Check the SMTP configuration and try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process the password reset request",
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token) ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset request",
      });
    }

    if (password.length < 8 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password must contain 8 to 128 characters",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpires +passwordHash");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password. Please try again.",
    });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    res.clearCookie(COOKIE_NAME, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

// GET CURRENT USER PROFILE
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(userId)
      .populate("interviews")
      .select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Get Profile Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile",
    });
  }
};

// OLD GOOGLE AUTH: DISABLED
exports.googleAuth = async (req, res) => {
  return res.status(410).json({
    success: false,
    message: "Google login is disabled. Please use email and password.",
  });
};
