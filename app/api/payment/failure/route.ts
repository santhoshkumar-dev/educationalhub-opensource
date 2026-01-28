import { NextRequest, NextResponse } from "next/server";
import Payment from "@/models/payment";
import connectMongoDB from "@/lib/connectMongoDB";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();

    // Get form data from PayU POST request
    const formData = await req.formData();

    const payuResponse = {
      txnid: formData.get("txnid") as string,
      amount: formData.get("amount") as string,
      status: formData.get("status") as string,
      error_Message: (formData.get("error_Message") as string) || undefined,
      field9: (formData.get("field9") as string) || undefined,
      mihpayid: (formData.get("mihpayid") as string) || undefined,
      mode: (formData.get("mode") as string) || undefined,
    };

    console.log("PayU Failure Response:", payuResponse);

    // Find and update payment record
    const payment = await Payment.findOne({
      transactionId: payuResponse.txnid,
    });

    if (payment) {
      payment.paymentStatus = "failed";
      payment.payuResponse = payuResponse;
      payment.failureReason =
        payuResponse.error_Message ||
        payuResponse.field9 ||
        "Payment failed or cancelled by user";
      payment.payuMoneyId = payuResponse.mihpayid;
      payment.paymentMode = payuResponse.mode;
      payment.completedAt = new Date();

      await payment.save();

      console.log(
        `❌ Payment failed for txnid: ${payuResponse.txnid}, reason: ${payment.failureReason}`,
      );
    } else {
      console.error("Payment record not found for txnid:", payuResponse.txnid);
    }

    // Redirect to failure page with details
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/failure?txnid=${payuResponse.txnid}&reason=${encodeURIComponent(payment?.failureReason || "Payment failed")}`,
      },
    });
  } catch (error) {
    console.error("Payment failure handler error:", error);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/failure?error=server_error`,
      },
    });
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log("Payment failure GET request received");

    return NextResponse.json(
      { message: "Payment failure endpoint is active" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Payment failure GET handler error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
