const mongoose = require("mongoose");

const userPreferencesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    interests: [
      {
        categoryId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "CourseCategory",
          required: true,
        },
        categoryName: {
          type: String,
          required: true,
        },
        priority: {
          type: Number,
          default: 1,
          min: 1,
          max: 5,
        },
      },
    ],
    skillLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "all"],
      default: "all",
    },
    priceRange: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 10000,
      },
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Index for efficient queries
userPreferencesSchema.index({ userId: 1 });
userPreferencesSchema.index({ "interests.categoryId": 1 });

module.exports =
  mongoose.models.UserPreferences ||
  mongoose.model("UserPreferences", userPreferencesSchema);
