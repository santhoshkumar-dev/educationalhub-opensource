const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercentage: { type: Number, required: true }, // e.g., 10 means 10% off
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
  usageLimit: { type: Number, default: 1 }, // number of uses allowed
  usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }, // optional if it's course-specific
});
