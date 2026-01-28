import mongoose from "mongoose";

const CourseCategorySchema = new mongoose.Schema({
  img: { type: String, required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
});

const CourseCategory =
  mongoose.models.CourseCategory ||
  mongoose.model("CourseCategory", CourseCategorySchema);

export default CourseCategory;
