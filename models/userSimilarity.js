const mongoose = require("mongoose");

const userSimilaritySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    similarUsers: [
      {
        userId: String,
        similarity: Number,
        updatedAt: Date,
      },
    ],
    lastCalculated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.UserSimilarity ||
  mongoose.model("UserSimilarity", userSimilaritySchema);
