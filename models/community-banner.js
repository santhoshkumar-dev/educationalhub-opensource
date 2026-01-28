import mongoose from "mongoose";

const bannerButtonSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
    color: {
      type: String,
      enum: ["success", "default", "primary", "secondary", "warning", "danger"],
      default: "primary",
    },
  },
  { _id: false },
);

const communityBannerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    buttons: [bannerButtonSchema],
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 }, // Higher priority shown first
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
  },
  {
    timestamps: true,
    collection: "communityBanner",
  },
);

const CommunityBanner =
  mongoose.models.CommunityBanner ||
  mongoose.model("CommunityBanner", communityBannerSchema);

export default CommunityBanner;
