import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clerkUserId: {
      type: String,
      required: true,
    },
    clientId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["active", "ended", "expired", "abandoned"],
      default: "active",
    },
    createdAt: {
      type: Date,
      required: true,
    },
    lastActiveAt: {
      type: Date,
    },
    expireAt: {
      type: Date,
    },
    abandonAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    endedAt: {
      type: Date,
    },
    duration: {
      type: Number, // in milliseconds
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
  },
);

// Index for efficient queries
sessionSchema.index({ clerkUserId: 1, createdAt: -1 });
sessionSchema.index({ sessionId: 1 });
sessionSchema.index({ userId: 1, createdAt: -1 });

// Pre-save middleware to calculate duration when session ends
sessionSchema.pre("save", function (next) {
  if (this.status === "ended" && this.createdAt && !this.duration) {
    this.duration = Date.now() - this.createdAt.getTime();
  }
  next();
});

const Session =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);

export default Session;
