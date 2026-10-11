const express = require("express");
const router = express.Router();

const AuthController = require("../controller/AuthController");
const isAuth = require("../middlewares/isAuth");

// Register
router.post("/register", AuthController.register);

// Login
router.post("/login", AuthController.login);

// Forgot password: send reset link to email
router.post("/forgot-password", AuthController.forgotPassword);

// Reset password: verify token and update password
router.post("/reset-password", AuthController.resetPassword);

// Logout
router.post("/logout", AuthController.logout);

// Current logged-in user's profile
router.get("/profile", isAuth, AuthController.getProfile);

module.exports = router;
