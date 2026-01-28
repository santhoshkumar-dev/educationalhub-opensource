const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      unique: true,
    },
    recommendations: [
      {
        courseId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Course",
        },
        score: Number,
        reason: {
          type: String,
          enum: [
            "collaborative",
            "content-based",
            "hybrid",
            "trending",
            "category",
          ],
        },
        sources: [String],
      },
    ],
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Recommendation ||
  mongoose.model("Recommendation", recommendationSchema);
