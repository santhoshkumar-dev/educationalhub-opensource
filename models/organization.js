import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    emailDomain: { type: String },
    contactEmail: { type: String },
    logo: { type: String },
    slug: { type: String, unique: true },
    description: { type: String },
    htmlDescription: { type: String },
    website: { type: String },
    orgType: {
      type: String,
      enum: [
        "open-source",
        "non-profit",
        "corporate",
        "educational",
        "freelancer",
        "community",
      ],
      required: true,
    },
    contributionType: {
      type: String,
      enum: ["free", "paid", "both"],
      default: "free",
    },
    socialLinks: {
      github: String,
      linkedin: String,
      twitter: String,
      facebook: String,
      instagram: String,
      youtube: String,
    },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pincode: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" },
    },
    mapUrl: { type: String },
    phone: { type: String },
  },
  { timestamps: true },
);

const Organization =
  mongoose.models.Organization ||
  mongoose.model("Organization", organizationSchema);

export default Organization;
