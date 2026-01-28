import mongoose from "mongoose";

const institutionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    emailDomain: { type: String }, // for restricting signup e.g. "@mit.edu"
    contactEmail: { type: String },
    logo: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pincode: { type: String },
    phone: { type: String },
    website: { type: String },
    slug: { type: String, unique: true },
    bio: { type: String },
    htmlBio: { type: String },
    parentUniversity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "University",
    },
    socialLinks: {
      github: { type: String },
      facebook: { type: String },
      twitter: { type: String },
      instagram: { type: String },
      linkedin: { type: String },
      youtube: { type: String },
    },
    type: {
      type: String,
      enum: ["college", "school", "institute"],
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" }, // [longitude, latitude]
    },
    mapUrl: { type: String },
  },
  {
    timestamps: true,
  },
);

const Institution =
  mongoose.models.Institution ||
  mongoose.model("Institution", institutionSchema);

export default Institution;
