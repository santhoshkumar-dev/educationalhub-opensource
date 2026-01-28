import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import Payment from "@/models/payment";
import Course from "@/models/course";
import User from "@/models/userModel";
import connectMongoDB from "@/lib/connectMongoDB";
import { generateHash, generateTxnId } from "@/utils/payuHelper";
import { PaymentInitiateRequest, PayUFormData } from "@/types/payment";

export async function POST(req: NextRequest) {
  try {
    // Get userId from Clerk auth
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    // Get full user data
    const user = await User.findOne({ clerk_id: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body: PaymentInitiateRequest = await req.json();
    const { courseId } = body;

    // 1. Fetch course details
    const course = await Course.findById(courseId);
    if (!course || !course.isPaid) {
      return NextResponse.json(
        { error: "Invalid course or course is free" },
        { status: 400 },
      );
    }

    // 2. Check if user already purchased
    const existingPayment = await Payment.findOne({
      clerkUserId: userId,
      courseId,
      paymentStatus: "success",
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "Course already purchased" },
        { status: 400 },
      );
    }

    // 3. Calculate amount (check for discounts)
    const amount = course.discountedPrice || course.price;

    // 4. Generate transaction ID
    const txnid = generateTxnId();

    // 5. Create payment record
    const payment = new Payment({
      userId: user._id,
      courseId,
      transactionId: txnid,
      amount,
      originalPrice: course.price,
      discountApplied: course.price - amount,
      paymentStatus: "pending",

      // Additional info
      firstName: user.first_name || "User",
      email: user.email,
      phone: user.phone || "",
      productInfo: course.course_name,
    });

    await payment.save();

    // 6. Generate PayU hash
    const hash = generateHash({
      key: process.env.PAYU_MERCHANT_KEY!,
      txnid,
      amount: amount.toString(),
      productinfo: course.course_name,
      firstname: user.first_name || "User",
      email: user.email,
      salt: process.env.PAYU_MERCHANT_SALT!,
      udf1: "",
      udf2: "",
      udf3: "",
      udf4: "",
      udf5: "",
    });

    // 7. Prepare PayU data
    const payuData: PayUFormData = {
      key: process.env.PAYU_MERCHANT_KEY!,
      txnid,
      amount: amount.toString(),
      productinfo: course.course_name,
      firstname: user.first_name || "User",
      email: user.email,
      phone: "",
      surl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/success`,
      furl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/failure`,
      hash,
      service_provider: "payu_paisa",
    };

    return NextResponse.json({
      success: true,
      payuData,
      paymentUrl:
        process.env.PAYU_MODE === "test"
          ? "https://test.payu.in/_payment"
          : "https://secure.payu.in/_payment",
      paymentId: payment._id.toString(),
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Payment initiation failed" },
      { status: 500 },
    );
  }
}
