import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

followSchema.index({ user: 1, follower: 1 }, { unique: true });

const Follow = mongoose.models.Follow || mongoose.model("Follow", followSchema);

export default Follow;
