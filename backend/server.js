require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");

// Routes
const AuthRoute = require("./routes/AuthRoute");
const UserRoute = require("./routes/UserRoute");
const InterviewRoute = require("./routes/interviewRoute");
const PaymentRoute = require("./routes/paymentRoute");

const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 8000;

// DB Connect
connectDB();

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Debug Logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", AuthRoute);
app.use("/api/user", UserRoute);
app.use("/api/interview", InterviewRoute);
app.use("/api/payment", PaymentRoute);

// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Interview Agent Backend Running",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});