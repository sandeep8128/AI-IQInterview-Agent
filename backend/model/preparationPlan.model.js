const mongoose = require("mongoose");

const preparationTaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    category: {
      type: String,
      enum: [
        "DSA",
        "Technical",
        "HR",
        "Communication",
        "Resume",
        "Project",
        "General",
      ],
      default: "General",
    },

    topic: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    estimatedMinutes: {
      type: Number,
      default: 30,
      min: 5,
      max: 480,
    },

    dayNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 90,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const preparationPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    targetRole: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    experience: {
      type: String,
      default: "Fresher",
      trim: true,
      maxlength: 100,
    },

    durationDays: {
      type: Number,
      default: 7,
      min: 1,
      max: 90,
    },

    basedOnInterviewIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview",
      },
    ],

    weakAreas: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    dailyTasks: {
      type: [preparationTaskSchema],
      default: [],
      validate: {
        validator: (tasks) => tasks.length <= 300,
        message: "A preparation plan cannot contain more than 300 tasks.",
      },
    },

    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
      index: true,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

preparationPlanSchema.index({
  userId: 1,
  status: 1,
  updatedAt: -1,
});

const PreparationPlan = mongoose.model(
  "PreparationPlan",
  preparationPlanSchema,
);

module.exports = PreparationPlan;
