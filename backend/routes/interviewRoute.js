const express = require("express");
const router = express.Router();

const interviewController = require("../controller/InterViewController");
const isAuth = require("../middlewares/isAuth");
const upload = require("../middlewares/multer");

// Resume Analysis
router.post(
  "/resume",
  isAuth,
  upload.single("resume"),
  interviewController.analyzResume,
);

// Interview Flow
router.post(
  "/generate-questions",
  isAuth,
  interviewController.generateQuestions,
);

router.post("/submit-answer", isAuth, interviewController.submitAnswer);

router.post("/finish", isAuth, interviewController.finishInterview);

// Interview History
router.get("/my-interviews", isAuth, interviewController.getMyInterviews);

// Interview Report
router.get("/report/:id", isAuth, interviewController.getInterviewReport);

module.exports = router;
