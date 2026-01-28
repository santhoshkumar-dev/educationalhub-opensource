import React from "react";
import { Button } from "@heroui/react";
import { ShoppingCart, CreditCard } from "lucide-react";

interface LockedContentOverlayProps {
  hasUser: boolean;
  onSignIn: () => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isProcessing: boolean;
}

export const LockedContentOverlay: React.FC<LockedContentOverlayProps> = ({
  hasUser,
  onSignIn,
  onAddToCart,
  onBuyNow,
  isProcessing,
}) => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-900 text-white">
      <div className="max-w-md space-y-4 p-8 text-center">
        <div className="mb-4 text-6xl">🔒</div>
        <h3 className="text-2xl font-bold">
          Purchase this course to access this content
        </h3>
        <p className="text-gray-400">
          This video is part of a paid course. Unlock full access to all course
          materials.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          {!hasUser ? (
            <Button color="primary" size="lg" onPress={onSignIn}>
              Sign In to Continue
            </Button>
          ) : (
            <>
              <Button
                color="secondary"
                size="lg"
                startContent={<ShoppingCart size={18} />}
                onPress={onAddToCart}
              >
                Add to Cart
              </Button>
              <Button
                color="primary"
                size="lg"
                startContent={<CreditCard size={18} />}
                onPress={onBuyNow}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Buy Now"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
