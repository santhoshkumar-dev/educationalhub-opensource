"use client";

import { useCart } from "@/app/context/CartContext";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Trash2, ShoppingCart, CreditCard } from "lucide-react";
import { Button } from "@heroui/react";
import LoginModal from "@/components/ClerkLoginPopup";

export default function CartPage() {
  const { state, removeFromCart, clearCart } = useCart();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleRemoveItem = async (itemId: string) => {
    await removeFromCart(itemId);
  };

  const handleClearCart = async () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      await clearCart();
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }

    if (state.items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: state.items.map((item) => ({
            courseId: item._id,
            price: item.discountedPrice ?? item.price,
          })),
          total: state.total,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to payment gateway
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.paymentUrl;

        Object.entries(data.payuData).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        alert("Checkout failed. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("An error occurred during checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (state.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log("state", state);

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen px-4 py-8 md:px-12 xl:px-24">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
          <div className="py-16 text-center">
            <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h2 className="mb-4 text-2xl font-semibold text-gray-600">
              Your cart is empty
            </h2>
            <p className="mb-8 text-gray-500">
              Browse our courses and add them to your cart to get started.
            </p>
            <Link href="/courses">
              <Button color="primary" size="lg">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-12 xl:px-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Button
            color="danger"
            onClick={handleClearCart}
            startContent={<Trash2 className="h-4 w-4" />}
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {state.items.map((item) => (
              <div key={item._id} className="rounded-lg border p-6 shadow-sm">
                <div className="flex gap-4">
                  <div className="relative h-20 w-32 flex-shrink-0">
                    <Image
                      src={item.course_image || "/placeholder-course.jpg"}
                      alt={item.course_name}
                      fill
                      className="rounded-lg object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="mb-2 text-lg font-semibold">
                      <Link
                        href={`/courses/${item.slug}`}
                        className="transition-colors hover:text-primary"
                      >
                        {item.course_name}
                      </Link>
                    </h3>

                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.instructors && item.instructors.length > 0
                        ? `By ${item.instructors.map((inst) => `${inst.first_name} ${inst.last_name}`).join(", ")}`
                        : item.organization?.name
                          ? `By ${item.organization.name}`
                          : "By Anonymous"}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.discountedPrice &&
                        item.discountedPrice < item.price ? (
                          <>
                            <span className="text-xl font-bold text-primary">
                              ₹{item.discountedPrice.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ₹{item.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-xl font-bold">
                            ₹{item.price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <Button
                        color="danger"
                        variant="light"
                        size="sm"
                        onClick={() => handleRemoveItem(item._id)}
                        startContent={<Trash2 className="h-4 w-4" />}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="h-fit rounded-lg border p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

            <div className="mb-6 space-y-3">
              <div className="flex justify-between">
                <span>Subtotal ({state.items.length} items)</span>
                <span>
                  ₹
                  {state.items
                    .reduce((sum, item) => sum + item.price, 0)
                    .toLocaleString()}
                </span>
              </div>

              {/* Only show discount if there's actually a discount */}
              {state.items.some(
                (item) =>
                  item.discountedPrice &&
                  item.discountedPrice > 0 &&
                  item.discountedPrice < item.price,
              ) && (
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span className="text-green-600">
                    -₹
                    {(
                      state.items.reduce((sum, item) => sum + item.price, 0) -
                      state.total
                    ).toLocaleString()}
                  </span>
                </div>
              )}

              <hr className="dark:border-gray-700" />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>₹{state.total.toLocaleString()}</span>
              </div>
            </div>

            <Button
              color="primary"
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              isLoading={isProcessing}
              startContent={!isProcessing && <CreditCard className="h-5 w-5" />}
            >
              {isProcessing ? "Processing..." : "Proceed to Checkout"}
            </Button>

            <p className="mt-4 text-center text-xs text-gray-500">
              By proceeding to checkout, you agree to our Terms of Service and
              Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        mode="signin"
        onModeSwitch={() => {}}
      />
    </div>
  );
}
