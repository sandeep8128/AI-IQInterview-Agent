const express = require("express");
const passport = require("passport");

const route = express.Router();

const AuthController = require("../controller/AuthController");
const { generateToken } = require("../config/JwtToken");

// Old Routes
route.post("/googleAuth", AuthController.googleAuth);
route.get("/logout", AuthController.logout);


module.exports = route;

// New Google OAuth Route
route.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

route.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  async (req, res) => {
    try {
      const token = generateToken(req.user._id);

      res.cookie("AuthToken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });

      res.redirect(process.env.CLIENT_URL);

    } catch (error) {
      console.log(error);

      res.redirect(
        `${process.env.CLIENT_URL}?auth=failed`
      );
    }
  }
);

module.exports = route;