"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface PaymentStatus {
  status: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  udf1: string;
  udf2: string;
  udf3: string;
  udf4: string;
  udf5: string;
  field1: string;
  field2: string;
  field3: string;
  field4: string;
  field5: string;
  field6: string;
  field7: string;
  field8: string;
  field9: string;
  hash: string;
  bank_ref_num: string;
  bankcode: string;
  cardToken: string;
  error_Message: string;
  unmappedstatus: string;
  net_amount_debit: string;
  discount: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const txnid = searchParams.get("txnid");
  const amount = searchParams.get("amount");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!txnid) {
        setError("Transaction ID not found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/payment/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ txnid }),
        });

        const data = await response.json();

        if (response.ok) {
          setPaymentStatus(data.paymentStatus);
        } else {
          setError(data.error || "Failed to verify payment");
        }
      } catch (err) {
        setError("Network error occurred");
        console.error("Payment verification error:", err);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [txnid]);

  const isSuccess = paymentStatus?.status === "success";
  const isFailed = paymentStatus?.status === "failure";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-lg font-medium">Verifying your payment...</p>
            <p className="mt-2 text-sm text-gray-500">
              Please wait while we confirm your transaction.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <XCircle className="mr-2 h-6 w-6" />
              Verification Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-600">{error}</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle
            className={`flex items-center justify-center text-center ${
              isSuccess ? "text-green-600" : "text-red-600"
            }`}
          >
            {isSuccess ? (
              <>
                <CheckCircle className="mr-2 h-8 w-8" />
                Payment Successful!
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-8 w-8" />
                Payment Failed
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentStatus && (
            <div className="space-y-3">
              <div className="rounded-lg p-4">
                <h3 className="mb-2 font-semibold">Transaction Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Transaction ID:</div>
                  <div className="break-all">{paymentStatus.txnid}</div>
                  <div className="font-medium">Amount:</div>
                  <div>₹{paymentStatus.amount}</div>
                  <div className="font-medium">Status:</div>
                  <div
                    className={`font-medium capitalize ${
                      isSuccess ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {paymentStatus.status}
                  </div>
                  {paymentStatus.productinfo && (
                    <>
                      <div className="font-medium">Course:</div>
                      <div>{paymentStatus.productinfo}</div>
                    </>
                  )}
                  {paymentStatus.bank_ref_num && (
                    <>
                      <div className="font-medium">Bank Ref:</div>
                      <div>{paymentStatus.bank_ref_num}</div>
                    </>
                  )}
                </div>
              </div>

              {isSuccess && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <p className="text-green-800">
                    🎉 Congratulations! Your payment has been processed
                    successfully. You now have access to your purchased course.
                  </p>
                </div>
              )}

              {isFailed && paymentStatus.error_Message && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-red-800">
                    <strong>Error:</strong> {paymentStatus.error_Message}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            {isSuccess ? (
              <>
                <Button
                  onClick={() => router.push("/my-profile?tab=courses")}
                  className="flex-1"
                >
                  View My Courses
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="flex-1"
                >
                  Continue Shopping
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => router.back()} className="flex-1">
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  className="flex-1"
                >
                  Go to Home
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
