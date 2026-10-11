const mongoose = require("mongoose");

const communicationMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

const communicationReportSchema = new mongoose.Schema(
  {
    overallScore: { type: Number, min: 0, max: 10, default: 0 },
    grammar: { type: Number, min: 0, max: 10, default: 0 },
    vocabulary: { type: Number, min: 0, max: 10, default: 0 },
    clarity: { type: Number, min: 0, max: 10, default: 0 },
    relevance: { type: Number, min: 0, max: 10, default: 0 },
    fluency: { type: Number, min: 0, max: 10, default: 0 },

    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    corrections: [
      {
        original: { type: String, required: true },
        corrected: { type: String, required: true },
        explanation: { type: String, default: "" },
      },
    ],
    summary: {
      type: String,
      default: "",
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const communicationSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "English Communication Practice",
      maxlength: 100,
    },
    messages: {
      type: [communicationMessageSchema],
      default: [],
      validate: {
        validator: (messages) => messages.length <= 200,
        message: "A session cannot contain more than 200 messages.",
      },
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
      index: true,
    },
    durationSeconds: {
      type: Number,
      default: 0,
      min: 0,
    },
    report: {
      type: communicationReportSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

communicationSessionSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model(
  "CommunicationSession",
  communicationSessionSchema,
);
