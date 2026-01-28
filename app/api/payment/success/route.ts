import { NextRequest, NextResponse } from "next/server";
import Payment from "@/models/payment";
import Course from "@/models/course";
import User from "@/models/userModel";
import connectMongoDB from "@/lib/connectMongoDB";
import { verifyHash } from "@/utils/payuHelper";
import { PayUResponse } from "@/types/payment";

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();

    // Get form data from PayU POST request
    const formData = await req.formData();

    const payuResponse: PayUResponse = {
      txnid: formData.get("txnid") as string,
      amount: formData.get("amount") as string,
      productinfo: formData.get("productinfo") as string,
      firstname: formData.get("firstname") as string,
      email: formData.get("email") as string,
      status: formData.get("status") as string,
      hash: formData.get("hash") as string,
      mihpayid: (formData.get("mihpayid") as string) || undefined,
      mode: (formData.get("mode") as string) || undefined,
      bank_ref_num: (formData.get("bank_ref_num") as string) || undefined,
      error_Message: (formData.get("error_Message") as string) || undefined,
      field9: (formData.get("field9") as string) || undefined,
      // Include UDF fields
      udf1: (formData.get("udf1") as string) || "",
      udf2: (formData.get("udf2") as string) || "",
      udf3: (formData.get("udf3") as string) || "",
      udf4: (formData.get("udf4") as string) || "",
      udf5: (formData.get("udf5") as string) || "",
    };

    console.log("✅ PayU Success Response:", payuResponse);

    // 1. Verify hash with correct UDF values
    const isValid = verifyHash({
      key: process.env.PAYU_MERCHANT_KEY!,
      txnid: payuResponse.txnid,
      amount: payuResponse.amount,
      productinfo: payuResponse.productinfo,
      firstname: payuResponse.firstname,
      email: payuResponse.email,
      status: payuResponse.status,
      salt: process.env.PAYU_MERCHANT_SALT!,
      hash: payuResponse.hash,
      udf1: payuResponse.udf1 || "",
      udf2: payuResponse.udf2 || "",
      udf3: payuResponse.udf3 || "",
      udf4: payuResponse.udf4 || "",
      udf5: payuResponse.udf5 || "",
    });

    if (!isValid) {
      console.error("Invalid hash received - Possible tampering!");
      console.error("Hash verification failed for:", {
        txnid: payuResponse.txnid,
        udf1: payuResponse.udf1,
        udf2: payuResponse.udf2,
        udf3: payuResponse.udf3,
      });
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/failure?error=invalid_hash`,
        },
      });
    }

    // 2. Find payment record
    const payment = await Payment.findOne({
      transactionId: payuResponse.txnid,
    });

    if (!payment) {
      console.error("Payment record not found for txnid:", payuResponse.txnid);
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/failure?error=payment_not_found`,
        },
      });
    }

    // 3. Update payment record
    payment.paymentStatus =
      payuResponse.status === "success" ? "success" : "failed";
    payment.payuMoneyId = payuResponse.mihpayid;
    payment.paymentMode = payuResponse.mode;
    payment.bankRefNum = payuResponse.bank_ref_num;
    payment.payuResponse = payuResponse;
    payment.completedAt = new Date();

    if (payuResponse.status !== "success") {
      payment.failureReason =
        payuResponse.error_Message || payuResponse.field9 || "Payment failed";
    }

    await payment.save();

    // 4. Handle success
    if (payuResponse.status === "success") {
      const user = await User.findById(payment.userId);

      if (user) {
        if (payment.isCartPayment && payment.cartItems?.length > 0) {
          // --- CART CHECKOUT SUCCESS ---
          const newCourses = [];

          for (const item of payment.cartItems) {
            const courseId = item.courseId;
            if (!courseId) continue;

            const alreadyAdded = user.purchasedCourses?.some(
              (pc: any) => pc.courseId?.toString() === courseId.toString(),
            );

            if (!alreadyAdded) {
              newCourses.push({
                courseId,
                purchasedAt: new Date(),
                paymentId: payment._id,
                accessExpiryDate: null,
              });

              // Increment course enrolled count
              await Course.findByIdAndUpdate(courseId, {
                $inc: { enrolledCount: 1 },
              });
            }
          }

          if (newCourses.length > 0) {
            await User.findByIdAndUpdate(payment.userId, {
              $push: { purchasedCourses: { $each: newCourses } },
            });
          }

          // Clear user's cart after successful purchase
          await User.findByIdAndUpdate(payment.userId, {
            $set: { cart: [] },
          });

          console.log(
            `✅ Cart checkout success: ${user.email} purchased ${newCourses.length} course(s)`,
          );
        } else if (payment.courseId) {
          // --- SINGLE COURSE PAYMENT SUCCESS ---
          const alreadyAdded = user.purchasedCourses?.some(
            (pc: any) =>
              pc.courseId?.toString() === payment.courseId.toString(),
          );

          if (!alreadyAdded) {
            await User.findByIdAndUpdate(payment.userId, {
              $push: {
                purchasedCourses: {
                  courseId: payment.courseId,
                  purchasedAt: new Date(),
                  paymentId: payment._id,
                  accessExpiryDate: null,
                },
              },
            });

            await Course.findByIdAndUpdate(payment.courseId, {
              $inc: { enrolledCount: 1 },
            });

            console.log(
              `✅ Single course access granted: ${user.email} -> ${payment.courseId}`,
            );
          }
        }
      }

      // ✅ Redirect to success page
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success?txnid=${payuResponse.txnid}&amount=${payuResponse.amount}`,
        },
      });
    }

    // ❌ Payment failed
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/failure?txnid=${payuResponse.txnid}&reason=${encodeURIComponent(
          payment.failureReason || "Payment failed",
        )}`,
      },
    });
  } catch (error) {
    console.error("Payment success handler error:", error);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${process.env.NEXT_PUBLIC_SITE_URL}/payment/failure?error=server_error`,
      },
    });
  }
}
