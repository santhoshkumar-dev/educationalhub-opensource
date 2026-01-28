import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectMongoDB from "@/lib/connectMongoDB";
import User from "@/models/userModel";
import Payment from "@/models/payment";
import crypto from "crypto";
import { generateHash, generateTxnId } from "@/utils/payuHelper";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();

    // Fetch full user details
    const user = await User.findOne({ clerk_id: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { items, total } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    if (!total || total <= 0) {
      return NextResponse.json(
        { error: "Invalid total amount" },
        { status: 400 },
      );
    }

    // Generate transaction ID
    const txnid = generateTxnId();

    // PayU configuration
    const PAYU_MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY!;
    const PAYU_MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT!;
    const isTestMode = process.env.PAYU_MODE === "test";

    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/success`;
    const failureUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/failure`;

    // Build product info string
    const productInfo = `Educational Hub - ${items.length} Course${items.length > 1 ? "s" : ""}`;

    // PayU data fields
    const udf1 = JSON.stringify(items.map((item: any) => item.courseId)); // Store course IDs
    const udf2 = userId;
    const udf3 = "cart_checkout";
    const udf4 = "";
    const udf5 = "";

    // Create hash string
    const hash = generateHash({
      key: PAYU_MERCHANT_KEY,
      txnid,
      amount: total.toString(),
      productinfo: productInfo,
      firstname: user.first_name || "User",
      email: user.email,
      salt: PAYU_MERCHANT_SALT,
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
    });

    // Prepare PayU form data
    const payuData = {
      key: PAYU_MERCHANT_KEY,
      txnid,
      amount: total.toString(),
      productinfo: productInfo,
      firstname: user.first_name || "User",
      email: user.email,
      phone: user.phone || "",
      surl: successUrl,
      furl: failureUrl,
      service_provider: "payu_paisa",
      udf1,
      udf2,
      udf3,
      udf4,
      udf5,
      hash,
    };

    // Store a payment record
    const payment = new Payment({
      userId: user._id,
      transactionId: txnid,
      amount: total,
      paymentStatus: "pending",
      productInfo,
      isCartPayment: true,
      cartItems: items,
      firstName: user.first_name || "User",
      email: user.email,
    });

    await payment.save();

    return NextResponse.json({
      success: true,
      paymentUrl: isTestMode
        ? "https://test.payu.in/_payment"
        : "https://secure.payu.in/_payment",
      payuData,
      paymentId: payment._id.toString(),
    });
  } catch (error) {
    console.error("Cart checkout error:", error);
    return NextResponse.json(
      { error: "Cart checkout failed" },
      { status: 500 },
    );
  }
}
