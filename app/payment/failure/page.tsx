"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, Home } from "lucide-react";
import Lottie from "lottie-react";
import failedAnimation from "@/public/lottie/Failed.json";

const PaymentFailureSkeleton = () => (
  <div className="flex min-h-screen items-center justify-center p-4">
    <Card className="w-full max-w-md animate-pulse">
      <CardHeader>
        <div className="mx-auto h-16 w-16 rounded-full" />
        <div className="mx-auto mt-4 h-6 w-40 rounded" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-4 w-full rounded" />
        <div className="h-4 w-3/4 rounded" />
        <div className="mt-6 h-10 w-full rounded" />
        <div className="h-10 w-full rounded" />
      </CardContent>
    </Card>
  </div>
);

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  const txnid = searchParams.get("txnid");
  const amount = searchParams.get("amount");
  const errorMessage =
    searchParams.get("error_Message") || searchParams.get("error");

  const verifiedAmt = data?.transactionDetails?.amt || amount;
  const verifiedErrorMessage =
    data?.transactionDetails?.error_Message || errorMessage;

  useEffect(() => {
    if (!txnid) {
      setData({});
      setLoadingError("No Transaction ID provided.");
      return;
    }

    const verifyPayment = async () => {
      setData(null);
      setLoadingError(null);

      try {
        const response = await fetch("/api/payment/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ txnid }),
        });

        const apiResponse = await response.json();

        if (response.ok) {
          if (apiResponse.data?.status === "success") {
            router.replace(`/payment/success?txnid=${txnid}`);
            return;
          }
          setData(apiResponse);
        } else {
          throw new Error(apiResponse.error || "Payment verification failed.");
        }
      } catch (error: any) {
        console.error("Error verifying payment:", error);
        setData({});
        setLoadingError(error.message || "Failed to verify payment.");
      }
    };
    verifyPayment();
  }, [txnid, router]);

  if (data === null) {
    return <PaymentFailureSkeleton />;
  }

  const formattedAmount = verifiedAmt
    ? `₹${Number(verifiedAmt).toFixed(2)}`
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <Lottie
            animationData={failedAnimation}
            loop={true}
            className="mx-auto mb-2 h-32 w-32"
          />
          <CardTitle className="text-2xl font-bold">Payment Failed</CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            We couldn&apos;t process your payment
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Message - Only if specific */}
          {verifiedErrorMessage &&
            verifiedErrorMessage !== "Transaction Failed" && (
              <div className="rounded-lg bg-red-50 p-4 text-center">
                <p className="text-sm text-red-800">{verifiedErrorMessage}</p>
              </div>
            )}

          {/* Transaction Details - Compact */}
          <div className="space-y-2 text-center text-sm">
            {formattedAmount && (
              <p>
                Amount: <span className="font-semibold">{formattedAmount}</span>
              </p>
            )}
            {txnid && (
              <p>
                Transaction ID: <span className="font-semibold">{txnid}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => router.back()}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="w-full"
              size="lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>

          {/* Support Note */}
          <div className="border-t pt-4 text-center">
            <p className="text-xs text-gray-600">
              Money debited? Contact us with your transaction ID
            </p>
            <a
              href="mailto:support@educationalhub.in"
              className="mt-1 text-sm font-medium text-primary hover:underline"
            >
              support@educationalhub.in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
