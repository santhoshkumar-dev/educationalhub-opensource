import mongoose from "mongoose";

const courseLikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Prevent duplicate likes
courseLikeSchema.index({ user: 1, course: 1 }, { unique: true });

const CourseLike =
  mongoose.models.CourseLike || mongoose.model("CourseLike", courseLikeSchema);

export default CourseLike;
