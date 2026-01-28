import mongoose from "mongoose";

const upcomingCourseSchema = new mongoose.Schema(
  {
    tallyId: {
      type: String,
      required: true,
      unique: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    courseUrl: {
      type: String,
    },
    platform: {
      type: String,
    },
    votes: {
      type: Number,
      default: 0,
    },
    isAdded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const UpcomingCourse =
  mongoose.models.UpcomingCourse ||
  mongoose.model("UpcomingCourse", upcomingCourseSchema);

export default UpcomingCourse;
