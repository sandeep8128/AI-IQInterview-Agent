const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    timeLimit: {
      type: Number,
      default: 120,
    },

    answer: {
      type: String,
      default: "",
    },

    feedback: {
      type: String,
      default: "",
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    communication: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    correctness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: String,
      required: true,
      trim: true,
    },

    mode: {
      type: String,
      enum: ["HR", "Technical"],
      default: "Technical",
    },

    resumeText: {
      type: String,
      default: "",
    },

    questions: [questionSchema],

    finalScore: {
      type: Number,
      default: 0,
    },

    averageConfidence: {
      type: Number,
      default: 0,
    },

    averageCommunication: {
      type: Number,
      default: 0,
    },

    averageCorrectness: {
      type: Number,
      default: 0,
    },

    overallFeedback: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["incomplete", "completed"],
      default: "incomplete",
    },
  },
  {
    timestamps: true,
  }
);

const Interview = mongoose.model(
  "Interview",
  interviewSchema
);

module.exports = Interview;