import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  video_src: { type: String, required: true },
  video_length: { type: String },
  preview: { type: Boolean, default: false },
  type: { type: String, enum: ["video", "file"], default: "video" },
});

const ChapterSchema = new mongoose.Schema({
  chapter_name: { type: String, required: true },
  videos: {
    type: [VideoSchema],
    default: [],
  },
});

const CourseSchema = new mongoose.Schema(
  {
    course_name: { type: String, required: true },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected", ""],
      default: "pending",
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CourseCategory",
        required: true,
      },
    ],
    slug: { type: String, unique: true, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    course_image: { type: String, required: true },
    htmlDescription: { type: String, required: true },
    description: { type: String, required: true },
    rating: { type: Number, default: 0 },
    total_chapters: { type: Number, default: 0 },
    total_videos: { type: Number, default: 0 },

    // NEW FIELDS:
    chapters: { type: [ChapterSchema], default: [] },
    videos: { type: [VideoSchema], default: [] }, // flat videos
    courseType: {
      type: String,
      enum: ["chapter", "video"],
      default: "chapter",
    },

    published: { type: Boolean, default: false },
    tags: [String],
    instructors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
    },

    // Price Fields
    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    discountedPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },

    // Additional Fields
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);

export default Course;
