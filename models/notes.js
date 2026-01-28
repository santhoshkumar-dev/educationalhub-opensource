import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    userId: {
      // Storing the Clerk User ID
      type: String,
      required: true,
    },
    courseId: {
      // Storing the MongoDB ObjectId of the course
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    chapterId: {
      // Storing the chapter's _id from the Course model
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Note || mongoose.model("Note", NoteSchema);
