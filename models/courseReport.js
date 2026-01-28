import mongoose from "mongoose";

const courseReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  reportType: {
    type: String,
    enum: [
      // Technical Issues
      "Broken Files",
      "Video Playback Issue",
      "Audio Issue",
      // Content Issues
      "Missing Files",
      "Inaccurate Information",
      "Misleading Title/Description",
      // Policy Violations
      "Copyright Claim (DMCA)",
      "Spam or Advertisement",
      "Offensive Content",
      "Accessibility Issue",
      // Catch-all
      "Other",
    ],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Progress", "Resolved"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CourseReport =
  mongoose.models.CourseReport ||
  mongoose.model("CourseReport", courseReportSchema);

export default CourseReport;
