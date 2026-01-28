const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" }, // optional
  enrolledAt: { type: Date, default: Date.now },
  paid: { type: Boolean, default: false },
  amountPaid: { type: Number, default: 0 },
  couponUsed: { type: String }, // store coupon code
  certificateIssued: { type: Boolean, default: false },
});
