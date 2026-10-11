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
      min: 1,
      max: 600,
    },

    answer: {
      type: String,
      default: "",
      maxlength: 10000,
    },

    feedback: {
      type: String,
      default: "",
      maxlength: 2000,
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    communication: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    correctness: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
  },
  {
    _id: false,
  },
);

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    experience: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    mode: {
      type: String,
      enum: ["HR", "Technical"],
      default: "Technical",
      set: function (value) {
        if (typeof value !== "string") {
          return value;
        }

        const normalizedValue = value.trim().toLowerCase();

        if (normalizedValue === "hr") return "HR";
        if (normalizedValue === "technical") return "Technical";

        return value.trim();
      },
    },

    resumeText: {
      type: String,
      default: "",
      maxlength: 20000,
    },

    questions: {
      type: [questionSchema],
      default: [],
      validate: {
        validator: (questions) => questions.length <= 10,
        message: "An interview cannot contain more than 10 questions.",
      },
    },

    finalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    averageConfidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    averageCommunication: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    averageCorrectness: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    overallFeedback: {
      type: String,
      default: "",
      maxlength: 8000,
    },

    status: {
      type: String,
      enum: ["incomplete", "completed"],
      default: "incomplete",
    },
  },
  {
    timestamps: true,
  },
);

const Interview = mongoose.model("Interview", interviewSchema);

module.exports = Interview;
