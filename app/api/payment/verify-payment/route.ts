import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

interface PayUVerificationResponse {
  status: number;
  msg: string;
  transaction_details: {
    [key: string]: {
      mihpayid: string;
      request_id: string;
      bank_ref_num: string;
      amt: string;
      transaction_amount: string;
      txnid: string;
      additional_charges: string;
      productinfo: string;
      firstname: string;
      bankcode: string;
      udf1: string;
      udf2: string;
      udf3: string;
      udf4: string;
      udf5: string;
      field2: string;
      field9: string;
      error_code: string;
      addedon: string;
      payment_source: string;
      card_type: string;
      error_Message: string;
      net_amount_debit: string;
      disc: string;
      mode: string;
      PG_TYPE: string;
      card_no: string;
      name_on_card: string;
      udf6: string;
      udf7: string;
      udf8: string;
      udf9: string;
      udf10: string;
      issuing_bank: string;
      card_token: string;
      status: string;
      unmappedstatus: string;
      Merchant_UTR: string;
      Settled_At: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const { txnid } = await request.json();

    if (!txnid) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 },
      );
    }

    // PayU verification API credentials
    const merchantKey = process.env.PAYU_MERCHANT_KEY;
    const salt = process.env.PAYU_MERCHANT_SALT;
    const command = "verify_payment";
    const var1 = txnid;

    if (!merchantKey || !salt) {
      return NextResponse.json(
        { error: "PayU credentials not configured" },
        { status: 500 },
      );
    }

    // Generate hash for verification
    const hashString = `${merchantKey}|${command}|${var1}|${salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    // PayU verification API endpoint
    const verificationUrl =
      process.env.NODE_ENV === "test"
        ? "https://test.payu.in/merchant/postservice.php?form=2"
        : "https://info.payu.in/merchant/postservice.php?form=2";

    // Prepare form data for PayU API
    const formData = new URLSearchParams();
    formData.append("key", merchantKey);
    formData.append("command", command);
    formData.append("hash", hash);
    formData.append("var1", var1);

    // Make request to PayU verification API
    const response = await fetch(verificationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      throw new Error(`PayU API responded with status: ${response.status}`);
    }

    const payuResponse: PayUVerificationResponse = await response.json();

    if (payuResponse.status !== 1) {
      return NextResponse.json(
        { error: payuResponse.msg || "Payment verification failed" },
        { status: 400 },
      );
    }

    // Extract transaction details
    const transactionKey = Object.keys(payuResponse.transaction_details)[0];
    const transactionDetails = payuResponse.transaction_details[transactionKey];

    if (!transactionDetails) {
      return NextResponse.json(
        { error: "Transaction details not found" },
        { status: 404 },
      );
    }

    // Map PayU response to our payment status format
    const paymentStatus = {
      status: transactionDetails.status,
      txnid: transactionDetails.txnid,
      amount: transactionDetails.amt,
      productinfo: transactionDetails.productinfo,
      firstname: transactionDetails.firstname,
      email: transactionDetails.udf1 || "", // Assuming email is stored in udf1
      phone: transactionDetails.udf2 || "", // Assuming phone is stored in udf2
      address1: "",
      city: "",
      state: "",
      country: "",
      zipcode: "",
      udf1: transactionDetails.udf1,
      udf2: transactionDetails.udf2,
      udf3: transactionDetails.udf3,
      udf4: transactionDetails.udf4,
      udf5: transactionDetails.udf5,
      field1: "",
      field2: transactionDetails.field2,
      field3: "",
      field4: "",
      field5: "",
      field6: "",
      field7: "",
      field8: "",
      field9: transactionDetails.field9,
      hash: "",
      bank_ref_num: transactionDetails.bank_ref_num,
      bankcode: transactionDetails.bankcode,
      cardToken: transactionDetails.card_token,
      error_Message: transactionDetails.error_Message,
      unmappedstatus: transactionDetails.unmappedstatus,
      net_amount_debit: transactionDetails.net_amount_debit,
      discount: transactionDetails.disc,
    };

    // If payment is successful, you might want to update your database here
    if (transactionDetails.status === "success") {
      try {
        // Call your API to update course access for the user
        // This should grant the user access to the purchased course
        const courseId = transactionDetails.udf3; // Assuming course ID is stored in udf3
        const userId = transactionDetails.udf4; // Assuming user ID is stored in udf4

        if (courseId && userId) {
          // Update your database to grant course access
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/courses/grant-access`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId,
                courseId,
                transactionId: transactionDetails.txnid,
                amount: transactionDetails.amt,
                paymentMethod: "PayU",
              }),
            },
          );
        }
      } catch (error) {
        console.error("Error updating course access:", error);
        // Don't fail the entire request if this fails
      }
    } else if (transactionDetails.status === "failure") {
      return NextResponse.json({
        error: transactionDetails.error_Message || "Payment failed",
        data: paymentStatus,
        transactionDetails,
      });
    }

    return NextResponse.json({ paymentStatus });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
