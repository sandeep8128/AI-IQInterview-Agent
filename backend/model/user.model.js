const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email is too long"],
    },

    // Hashed password for email/password authentication.
    // Optional to preserve existing Google-created accounts.
    passwordHash: {
      type: String,
      select: false,
      default: undefined,
    },

    avatar: {
      type: String,
      default: "",
    },

    credits: {
      type: Number,
      default: 100,
      min: 0,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isPremium: {
      type: Boolean,
      default: false,
    },

    // Email verification status for future authentication flows.
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Used for secure password-reset workflows.
    // Tokens should be stored as hashes, never as raw reset tokens.
    passwordResetTokenHash: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    interviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
