import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  first_name: {
    type: String,
    trim: true,
  },
  last_name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
  },
  bio: {
    type: String,
  },
  clerk_id: {
    type: String,
  },
  created_at: {
    type: Date,
  },
  profile_image_url: {
    type: String,
  },
  instagram: {
    type: String,
  },
  facebook: {
    type: String,
  },
  twitter: {
    type: String,
  },
  website: {
    type: String,
  },
  linkedin: {
    type: String,
  },
  emailNotifications: {
    type: Boolean,
    default: false,
  },
  courseUpdateNotifications: {
    type: Boolean,
    default: false,
  },
  coursePurchaseNotifications: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ["admin", "user", "instructor", "student"],
    default: "user",
  },
  onboardingComplete: {
    type: Boolean,
    default: false,
  },
  courseProgress: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
      courseSlug: {
        type: String,
      },
      watchedVideos: [
        {
          chapterIndex: Number,
          videoIndex: Number,
          watchedAt: {
            type: Date,
            default: Date.now,
          },
          currentTime: {
            type: Number,
            default: 0, // Playback position in seconds
          },
          duration: {
            type: Number,
            default: 0, // Total video duration in seconds
          },
          completed: {
            type: Boolean,
            default: false, // True when video is watched completely
          },
        },
      ],
    },
  ],
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  completedCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],

  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },

  purchasedCourses: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      purchasedAt: Date,
      paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
      accessExpiryDate: Date, // null for lifetime access
      purchasedAt: { type: Date, default: Date.now },
      accessExpiryDate: { type: Date, default: null }, // null for lifetime access
    },
  ],

  cart: [
    {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },

      default: [],
    },
  ],

  // Free course claims
  freeCoursesClaimedCount: { type: Number, default: 0 },
  freeCoursesLimit: { type: Number, default: 5 },
});

userSchema.index({ username: "text" });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
