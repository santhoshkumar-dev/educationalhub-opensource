// models/CourseProgress.ts
import mongoose, { Schema, Model } from "mongoose";
import { ICourseProgress, IVideoProgress } from "@/types/courseProgress";

const videoProgressSchema = new Schema<IVideoProgress>(
  {
    chapterIndex: { type: Number, required: true },
    videoIndex: { type: Number, required: true },
    currentTime: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    lastWatchedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const courseProgressSchema = new Schema<ICourseProgress>(
  {
    courseId: {
      type: String,
    },
    userId: {
      type: String,
    },
    clerkId: {
      type: String,
      required: true,
      index: true,
    },
    courseSlug: {
      type: String,
      required: true,
      index: true,
    },
    videos: {
      type: [videoProgressSchema],
      default: [], // Ensure it's always initialized as an array
      required: true,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Compound unique index
courseProgressSchema.index({ clerkId: 1, courseSlug: 1 }, { unique: true });

// Auto-update lastAccessedAt on save
courseProgressSchema.pre("save", function (next) {
  this.lastAccessedAt = new Date();
  next();
});

const CourseProgress: Model<ICourseProgress> =
  mongoose.models.CourseProgress ||
  mongoose.model<ICourseProgress>("CourseProgress", courseProgressSchema);

export default CourseProgress;
