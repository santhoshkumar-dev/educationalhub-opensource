import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Use the video name as _id
  title: { type: String, required: true },
  video_src: { type: String, required: true },
  video_length: { type: String },
});

const Video = mongoose.models.Video || mongoose.model("Video", VideoSchema);

export default Video;
