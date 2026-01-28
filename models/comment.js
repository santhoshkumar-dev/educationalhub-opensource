// santhoshkumar-dev/educationalhub-backend/santhoshkumar-dev-educationalhub-backend-13ca06eb9e0a393fc2244e69aa73774794faa6cf/models/commentModel.js
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Comment =
  mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default Comment;
