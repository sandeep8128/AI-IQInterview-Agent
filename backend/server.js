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
const PreparationPlanRoute = require("./routes/preparationPlanRoute");

const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 8000;

// Allowed frontend origins

const allowedOrigins = [
  "http://localhost:5173",
  "https://interviewagent-2-frontend.onrender.com",
  "https://ai-iq-interview-agent.vercel.app",
];

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin, such as server-to-server requests
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Limit request body size
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(cookieParser());
app.use(passport.initialize());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Test Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI Interview Agent Backend Running",
  });
});

// Routes
app.use("/api/auth", AuthRoute);
app.use("/api/user", UserRoute);
app.use("/api/interview", InterviewRoute);
app.use("/api/payment", PaymentRoute);
app.use("/api/preparation-plan", PreparationPlanRoute);

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body is too large",
    });
  }

  console.error("Server Error:", err.message);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Start server only after database connects
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
