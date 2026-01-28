const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // For single course purchase (optional for cart payments)
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: false,
  },

  // For cart checkout (multiple courses)
  isCartPayment: { type: Boolean, default: false },
  cartItems: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      title: String,
      price: Number,
      discountedPrice: Number,
    },
  ],

  // PayU specific fields
  transactionId: { type: String, unique: true },
  payuMoneyId: String,
  paymentMode: String,
  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed", "cancelled"],
    default: "pending",
  },

  // Pricing details
  amount: { type: Number, required: true },
  originalPrice: Number,
  discountApplied: Number,

  // PayU response data
  bankRefNum: String,
  payuResponse: Object,
  hash: String,

  // Additional info
  firstName: String,
  email: String,
  phone: String,
  productInfo: String,

  // Timestamps
  initiatedAt: { type: Date, default: Date.now },
  completedAt: Date,

  // Error tracking
  errorMessage: String,
  failureReason: String,
});

const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;
