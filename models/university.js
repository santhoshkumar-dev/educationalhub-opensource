import mongoose from "mongoose";

const universitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logo: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    pincode: { type: String },
    website: { type: String },
    emailDomain: { type: String }, // e.g. "@iitb.ac.in"
    description: { type: String },
    htmlDescription: { type: String },
    slug: { type: String, unique: true },
    bio: { type: String },
    socialLinks: {
      facebook: { type: String },
      twitter: { type: String },
      instagram: { type: String },
      linkedin: { type: String },
      youtube: { type: String },
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" }, // [longitude, latitude]
    },
    mapUrl: { type: String },
    phone: { type: String },
  },
  {
    timestamps: true,
  },
);

const University =
  mongoose.models.University || mongoose.model("University", universitySchema);

export default University;
