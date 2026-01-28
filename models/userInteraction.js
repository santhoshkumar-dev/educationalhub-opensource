const mongoose = require("mongoose");

const userInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    actions: [
      {
        type: {
          type: String,
          enum: ["view", "enroll", "like", "complete", "watch"],
          required: true,
        },
        weight: {
          type: Number,
          default: 1,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    score: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

userInteractionSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports =
  mongoose.models.UserInteraction ||
  mongoose.model("UserInteraction", userInteractionSchema);
