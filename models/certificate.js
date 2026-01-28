const certificateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  issuedAt: { type: Date, default: Date.now },
  certificateURL: { type: String }, // e.g., link to PDF or public page
  verified: { type: Boolean, default: false }, // for admin verification
});
